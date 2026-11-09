const mongoose = require('mongoose');
const User = require('../model/userSchema');
const Event = require('../model/event');
const Hall = require('../model/hallSchema');
const Booth = require('../model/boothSchema');
const Application = require('../model/applicationSchema');
const Message = require('../model/messageSchema');

const isId = (id) => mongoose.isValidObjectId(id);

// "a, b, c" ya ["a","b"] dono ko clean array bana deta hai
const toList = (v) => {
  if (v === undefined || v === null) return [];
  const arr = Array.isArray(v) ? v : String(v).split(',');
  return arr.map((s) => String(s).trim()).filter(Boolean);
};

// ───────────────────────── DASHBOARD ─────────────────────────
// GET /api/exhibitor/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [applications, myBooths, unreadMessages] = await Promise.all([
      Application.find({ exhibitor: userId }).select('status'),
      Booth.countDocuments({ assignedExhibitor: userId }),
      Message.countDocuments({ receiver: userId, read: false }),
    ]);
    const count = (s) => applications.filter((a) => a.status === s).length;

    res.status(200).json({
      success: true,
      stats: {
        totalApplications: applications.length,
        pending: count('pending'),
        approved: count('approved'),
        rejected: count('rejected'),
        myBooths,
        unreadMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard.', error: error.message });
  }
};

// ───────────────────────── PROFILE ─────────────────────────
// GET /api/exhibitor/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile.', error: error.message });
  }
};

// PUT /api/exhibitor/profile   (multipart/form-data, optional file field: logo)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, companyName, description, category, products, phone, website, contactEmail } = req.body;

    if (name !== undefined && String(name).trim()) user.name = String(name).trim();

    if (companyName !== undefined) {
      if (!String(companyName).trim()) {
        return res.status(400).json({ message: 'Company name cannot be empty.' });
      }
      user.set('companyDetails.companyName', String(companyName).trim());
    }
    if (description !== undefined) user.set('companyDetails.description', description);
    if (category !== undefined) user.set('companyDetails.category', category);
    if (products !== undefined) user.set('companyDetails.products', toList(products));
    if (phone !== undefined) user.set('companyDetails.contact.phone', phone);
    if (website !== undefined) user.set('companyDetails.contact.website', website);
    if (contactEmail !== undefined) user.set('companyDetails.contact.email', contactEmail);
    if (req.file) user.set('companyDetails.logoUrl', `/uploads/${req.file.filename}`);

    await user.save();

    const profile = user.toObject();
    delete profile.password;
    res.status(200).json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
};

// ───────────────────────── EVENTS & APPLICATIONS ─────────────────────────
// GET /api/exhibitor/events  -> open events + meri application ka status
exports.getOpenEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: { $in: ['Upcoming', 'Live'] } })
      .populate('hallId', 'name dimensions')
      .sort({ startDate: 1 })
      .lean();

    const apps = await Application.find({ exhibitor: req.user.id }).select('event status').lean();
    const statusByEvent = new Map(apps.map((a) => [String(a.event), a.status]));

    const result = events.map((e) => ({
      ...e,
      applicationStatus: statusByEvent.get(String(e._id)) || null,
    }));

    res.status(200).json({ success: true, events: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events.', error: error.message });
  }
};

// POST /api/exhibitor/applications   (multipart: eventId, products, message, documents[])
exports.applyToEvent = async (req, res) => {
  try {
    const { eventId, message, products } = req.body;
    if (!isId(eventId)) return res.status(400).json({ message: 'Valid eventId is required.' });

    const user = await User.findById(req.user.id);
    if (!user?.companyDetails?.companyName) {
      return res.status(400).json({ message: 'Please complete your company profile before applying.' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.status === 'Completed') {
      return res.status(400).json({ message: 'This event is already completed.' });
    }

    const existing = await Application.findOne({ exhibitor: user._id, event: eventId });
    if (existing && existing.status !== 'rejected') {
      return res.status(409).json({ message: `You have already applied (status: ${existing.status}).` });
    }

    const documents = (req.files || []).map((f) => ({
      name: f.originalname,
      url: `/uploads/${f.filename}`,
    }));

    const payload = {
      products: toList(products),
      message: message || '',
      status: 'pending',
      adminRemarks: '',
    };
    if (documents.length) payload.documents = documents;

    // Rejected thi to dobara apply (re-apply) allowed
    const application = existing
      ? await Application.findByIdAndUpdate(existing._id, payload, { new: true })
      : await Application.create({ exhibitor: user._id, event: eventId, ...payload });

    res.status(201).json({ success: true, message: 'Application submitted successfully.', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit application.', error: error.message });
  }
};

// GET /api/exhibitor/applications
exports.myApplications = async (req, res) => {
  try {
    const applications = await Application.find({ exhibitor: req.user.id })
      .populate('event', 'title startDate endDate venue status hallId bannerUrl')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications.', error: error.message });
  }
};

// DELETE /api/exhibitor/applications/:id   (sirf pending withdraw ho sakti hai)
exports.withdrawApplication = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ message: 'Invalid application id.' });
    const app = await Application.findOneAndDelete({
      _id: req.params.id,
      exhibitor: req.user.id,
      status: 'pending',
    });
    if (!app) return res.status(404).json({ message: 'Pending application not found.' });
    res.status(200).json({ success: true, message: 'Application withdrawn.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to withdraw application.', error: error.message });
  }
};

// ───────────────────────── BOOTHS ─────────────────────────
// GET /api/exhibitor/events/:eventId/booths  -> floor plan (event ke hall ke booths)
exports.getEventBooths = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!isId(eventId)) return res.status(400).json({ message: 'Invalid event id.' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const [hall, myApp, booths] = await Promise.all([
      Hall.findById(event.hallId),
      Application.findOne({ exhibitor: req.user.id, event: eventId }).select('status'),
      Booth.find({ hallId: event.hallId })
        .populate('assignedExhibitor', 'name companyDetails.companyName companyDetails.logoUrl')
        .sort({ 'gridPosition.row': 1, 'gridPosition.col': 1 })
        .lean(),
    ]);

    const data = booths.map((b) => ({
      ...b,
      isMine: !!b.assignedExhibitor && String(b.assignedExhibitor._id) === String(req.user.id),
    }));

    res.status(200).json({
      success: true,
      event: { _id: event._id, title: event.title, status: event.status },
      hall,
      applicationStatus: myApp?.status || null,
      canReserve: myApp?.status === 'approved',
      booths: data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch floor plan.', error: error.message });
  }
};

// POST /api/exhibitor/booths/:boothId/reserve    Body: { eventId }
exports.reserveBooth = async (req, res) => {
  try {
    const { boothId } = req.params;
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!isId(boothId) || !isId(eventId)) {
      return res.status(400).json({ message: 'Valid boothId and eventId are required.' });
    }

    const [booth, event] = await Promise.all([Booth.findById(boothId), Event.findById(eventId)]);
    if (!booth) return res.status(404).json({ message: 'Booth not found.' });
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (String(event.hallId) !== String(booth.hallId)) {
      return res.status(400).json({ message: 'This booth does not belong to the selected event.' });
    }
    if (event.status === 'Completed') {
      return res.status(400).json({ message: 'This event is already completed.' });
    }

    // Sirf approved application wala exhibitor booth le sakta hai
    const approved = await Application.findOne({ exhibitor: userId, event: eventId, status: 'approved' });
    if (!approved) {
      return res.status(403).json({ message: 'Your application is not approved for this event yet.' });
    }

    // ATOMIC: sirf tab update hoga jab booth abhi bhi 'available' ho
    // (do exhibitors ek hi waqt par click karein to sirf ek ko milega)
      const reserved = await Booth.findOneAndUpdate(
      { _id: boothId, status: 'available' },
      { status: 'reserved', assignedExhibitor: userId },
      { new: true }
    );
    if (!reserved) {
      return res.status(409).json({ message: 'Sorry, this booth was just taken by someone else.' });
    }

    res.status(200).json({
      success: true,
      message: `Booth ${reserved.boothNumber} requested. Waiting for admin approval.`,
      booth: reserved,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reserve booth.', error: error.message });
  }
};

// (sirf 'reserved' cancel ho sakta hai)
exports.cancelReservation = async (req, res) => {
  try {
    const { boothId } = req.params;
    if (!isId(boothId)) return res.status(400).json({ message: 'Invalid booth id.' });

    const booth = await Booth.findOne({ _id: boothId, assignedExhibitor: req.user.id });
    if (!booth) return res.status(404).json({ message: 'You do not hold this booth.' });

    if (booth.status === 'booked') {
      return res.status(400).json({ message: 'Booth is already approved by admin. Please contact admin to cancel.' });
    }

    booth.status = 'available';
    booth.assignedExhibitor = null;
    booth.details = { showcase: [], staff: [] };
    await booth.save();

    res.status(200).json({ success: true, message: 'Booth request cancelled.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel request.', error: error.message });
  }
};

// GET /api/exhibitor/my-booths
exports.getMyBooths = async (req, res) => {
  try {
    const booths = await Booth.find({ assignedExhibitor: req.user.id })
      .populate('hallId', 'name dimensions')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, booths });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booths.', error: error.message });
  }
};

exports.updateBoothDetails = async (req, res) => {
  try {
    const { boothId } = req.params;
    if (!isId(boothId)) return res.status(400).json({ message: 'Invalid booth id.' });

    // Sirf apna booth edit ho sakta hai
    const booth = await Booth.findOne({ _id: boothId, assignedExhibitor: req.user.id });
    if (!booth) return res.status(404).json({ message: 'Booth not found or not yours.' });

    const { showcase, staff } = req.body;

    if (showcase !== undefined) {
      booth.details.showcase = toList(showcase);
    }

    if (staff !== undefined) {
      if (!Array.isArray(staff) || staff.length > 10) {
        return res.status(400).json({ message: 'Staff must be an array (max 10 members).' });
      }
      booth.details.staff = staff
        .filter((s) => s && String(s.name || '').trim())
        .map((s) => ({
          name: String(s.name).trim(),
          role: String(s.role || '').trim(),
          phone: String(s.phone || '').trim(),
        }));
    }

    await booth.save();
    res.status(200).json({ success: true, message: 'Booth details updated.', booth });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booth details.', error: error.message });
  }
};

// Grid mein aas-paas (8 direction) wale booths jinke exhibitors assigned hain
exports.getNeighbors = async (req, res) => {
  try {
    const { boothId } = req.params;
    if (!isId(boothId)) return res.status(400).json({ message: 'Invalid booth id.' });

    const mine = await Booth.findOne({ _id: boothId, assignedExhibitor: req.user.id });
    if (!mine) return res.status(404).json({ message: 'Booth not found or not yours.' });

    const { row, col } = mine.gridPosition;

    const neighbors = await Booth.find({
      hallId: mine.hallId,
      _id: { $ne: mine._id },
      assignedExhibitor: { $ne: null },
      'gridPosition.row': { $gte: row - 1, $lte: row + 1 },
      'gridPosition.col': { $gte: col - 1, $lte: col + 1 },
    })
      .populate('assignedExhibitor', 'name companyDetails')
      .select('boothNumber gridPosition status assignedExhibitor');

    res.status(200).json({ success: true, neighbors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch neighbors.', error: error.message });
  }
};