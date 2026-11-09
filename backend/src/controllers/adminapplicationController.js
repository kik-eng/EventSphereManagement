
const mongoose = require('mongoose');
const Application = require('../model/applicationSchema');
const Event = require('../model/event');
const Booth = require('../model/boothSchema');
const Message = require('../model/messageSchema');
// GET /api/admin/applications?status=pending&eventId=...
exports.getAllApplications = async (req, res) => {
  try {
    const { status, eventId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (eventId && mongoose.isValidObjectId(eventId)) filter.event = eventId;

    const applications = await Application.find(filter)
      .populate('exhibitor', 'name email companyDetails')
      .populate('event', 'title startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications.', error: error.message });
  }
};

// PUT /api/admin/applications/:id/review    
exports.reviewApplication = async (req, res) => {
  try {
    const { status, adminRemarks = '' } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'." });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    application.status = status;
    application.adminRemarks = adminRemarks;
    await application.save();

    if (status === 'rejected') {
      const event = await Event.findById(application.event);
      if (event) {
            await Booth.updateMany(
          { hallId: event.hallId, assignedExhibitor: application.exhibitor, status: { $in: ['reserved', 'booked'] } },
          { status: 'available', assignedExhibitor: null, details: { showcase: [], staff: [] } }
        );
      }
    }

    res.status(200).json({ success: true, message: `Application ${status}.`, application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to review application.', error: error.message });
  }
};

exports.getBoothRequests = async (req, res) => {
  try {
    const status = ['reserved', 'booked', 'rejected', 'all'].includes(req.query.status) ? req.query.status : 'reserved';
    let items = [];

    // Pending (reserved) aur approved (booked) booths
    if (status !== 'rejected') {
      const filter = { assignedExhibitor: { $ne: null } };
      if (status !== 'all') filter.status = status;
      items = await Booth.find(filter)
        .populate('hallId', 'name')
        .populate('assignedExhibitor', 'name email companyDetails')
        .sort({ updatedAt: -1 })
        .lean();
    }

    // Rejected requests (booth ki rejections list se)
    if (status === 'rejected' || status === 'all') {
      const withRejections = await Booth.find({ 'rejections.0': { $exists: true } })
        .populate('hallId', 'name')
        .populate('rejections.exhibitor', 'name email companyDetails')
        .lean();

      const rejected = [];
      withRejections.forEach((b) => {
        b.rejections.forEach((r) => {
          rejected.push({
            _id: `${b._id}-${r._id}`,
            boothNumber: b.boothNumber,
            hallId: b.hallId,
            category: b.category,
            price: b.price,
            gridPosition: b.gridPosition,
            status: 'rejected',
            assignedExhibitor: r.exhibitor,
            rejectionRemarks: r.remarks,
            rejectedAt: r.rejectedAt,
          });
        });
      });
      rejected.sort((a, b) => new Date(b.rejectedAt) - new Date(a.rejectedAt));
      items = items.concat(rejected);
    }

    res.status(200).json({ success: true, booths: items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booth requests.', error: error.message });
  }
};

// PUT /api/admin/booth-requests/:id/review   
exports.reviewBoothRequest = async (req, res) => {
  try {
    const { action, remarks = '' } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'approve' or 'reject'." });
    }

    const booth = await Booth.findById(req.params.id);
    if (!booth) return res.status(404).json({ message: 'Booth not found.' });
    if (booth.status !== 'reserved' || !booth.assignedExhibitor) {
      return res.status(400).json({ message: 'This booth has no pending request.' });
    }

    const exhibitorId = booth.assignedExhibitor;
    const cleanRemarks = String(remarks).slice(0, 600);

    if (action === 'approve') {
      booth.status = 'booked';
    } else {
      // Reject ka record rakho, phir booth free kar do
      booth.rejections.push({ exhibitor: exhibitorId, remarks: cleanRemarks });
      booth.status = 'available';
      booth.assignedExhibitor = null;
      booth.details = { showcase: [], staff: [] };
    }
    await booth.save();

    const note = cleanRemarks ? ` Note: ${cleanRemarks}` : '';
    await Message.create({
      sender: req.user.id,
      receiver: exhibitorId,
      text: `Your request for booth ${booth.boothNumber} has been ${action === 'approve' ? 'approved' : 'rejected'}.${note}`,
    });

    res.status(200).json({
      success: true,
      message: `Booth ${booth.boothNumber} request ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to review booth request.', error: error.message });
  }
};