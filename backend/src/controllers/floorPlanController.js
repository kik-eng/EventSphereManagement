const Hall = require('../model/hallSchema');
const Booth = require('../model/boothSchema');
const User = require('../model/userSchema');

// 1. CREATE HALL & BATCH GENERATE BOOTHS
exports.createHallWithBooths = async (req, res) => {
  try {
    const {
      name,
      description,
      dimensions,
      defaultCategory = 'Standard',
      defaultPrice = 0,
    } = req.body;

    if (!name || !dimensions?.rows || !dimensions?.cols) {
      return res.status(400).json({
        message: 'Hall name, rows and columns are required.',
      });
    }

    const existing = await Hall.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: `A hall named "${name}" already exists.` });
    }

    const hall = await Hall.create({ name, description, dimensions });

    const boothDocs = [];
    for (let r = 0; r < dimensions.rows; r++) {
      for (let c = 0; c < dimensions.cols; c++) {
        const boothNumber = `B-${String(r + 1).padStart(2, '0')}-${String(c + 1).padStart(2, '0')}`;
        boothDocs.push({
          boothNumber,
          hallId: hall._id,
          category: defaultCategory,
          price: defaultPrice,
          status: 'available',
          gridPosition: { row: r, col: c },
        });
      }
    }

    await Booth.insertMany(boothDocs);

    res.status(201).json({
      success: true,
      message: `Hall "${name}" created with ${boothDocs.length} booths.`,
      hall,
      boothsGenerated: boothDocs.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create hall.', error: error.message });
  }
};

// 2. GET FLOOR PLAN (all halls + booths)
exports.getFloorPlan = async (req, res) => {
  try {
    const { hallId } = req.query;

    const halls = hallId
      ? await Hall.find({ _id: hallId })
      : await Hall.find().sort({ createdAt: -1 });

    if (!halls.length) {
      return res.status(200).json({ success: true, halls: [], booths: [] });
    }

    const hallIds = halls.map((h) => h._id);

    const booths = await Booth.find({ hallId: { $in: hallIds } })
      .populate('assignedExhibitor', 'name email companyDetails')
      .sort({ 'gridPosition.row': 1, 'gridPosition.col': 1 });

    res.status(200).json({ success: true, halls, booths });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch floor plan.', error: error.message });
  }
};

// 3. UPDATE BOOTH DETAILS (category, price, status)
exports.updateBooth = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, price, status } = req.body;

    const booth = await Booth.findById(id);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found.' });
    }

    if (category !== undefined) booth.category = category;
    if (price !== undefined) booth.price = price;
    if (status !== undefined) booth.status = status;

    if (status === 'available') {
      booth.assignedExhibitor = null;
    }

    await booth.save();

    const updated = await Booth.findById(id).populate('assignedExhibitor', 'name email companyDetails');

    res.status(200).json({ success: true, message: 'Booth updated successfully.', booth: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booth.', error: error.message });
  }
};

// 4. ASSIGN / APPROVE BOOTH FOR AN EXHIBITOR
exports.approveBooth = async (req, res) => {
  try {
    const { id } = req.params;
    const { exhibitorId } = req.body;

    if (!exhibitorId) {
      return res.status(400).json({ message: 'Exhibitor ID is required.' });
    }

    const exhibitor = await User.findOne({ _id: exhibitorId, role: 'exhibitor' });
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found or user is not an exhibitor.' });
    }

    const booth = await Booth.findById(id);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found.' });
    }

    if (booth.status === 'booked') {
      return res.status(400).json({ message: 'Booth is already booked by another exhibitor.' });
    }

    // Kisi aur exhibitor ne reserve kiya hua booth admin kisi aur ko na de sake
    if (booth.status === 'reserved' && String(booth.assignedExhibitor) !== String(exhibitorId)) {
      return res.status(400).json({ message: 'Booth is reserved by another exhibitor.' });
    }

    booth.assignedExhibitor = exhibitorId;
    booth.status = 'booked';
    await booth.save();

    const updated = await Booth.findById(id).populate('assignedExhibitor', 'name email companyDetails');

    res.status(200).json({
      success: true,
      message: `Booth ${booth.boothNumber} approved for ${exhibitor.name}.`,
      booth: updated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve booth.', error: error.message });
  }
};

exports.getExhibitors = async (req, res) => {
  try {
    const exhibitors = await User.find({ role: 'exhibitor' })
      .select('name email companyDetails')
      .sort({ name: 1 });

    res.status(200).json({ success: true, exhibitors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exhibitors.', error: error.message });
  }
};

// 6. GET ALL HALLS (event banate waqt dropdown ke liye)
exports.getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, halls });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch halls.', error: error.message });
  }
};