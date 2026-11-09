const User = require('../model/userSchema');
const Event = require('../model/event');
const Hall = require('../model/hallSchema');

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, hallId, venue, startDate, endDate, bannerUrl, ticketPrice, status } = req.body;

    // Optional Validation: Check if Hall exists in DB
    if (hallId) {
      const hallExists = await Hall.findById(hallId);
      if (!hallExists) {
        return res.status(404).json({ success: false, message: 'Specified Hall not found.' });
      }
    }

    const newEvent = new Event({
      title,
      description,
      hallId,
      venue,
      startDate,
      endDate,
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
      ticketPrice,
      status
    });

    await newEvent.save();
    res.status(201).json({ success: true, message: 'Event created successfully!', event: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Events (Populating Real DB Hall details)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('hallId');
    res.status(200).json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalExhibitors, totalAttendees] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'exhibitor' }),
      User.countDocuments({ role: 'attendee' })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalExhibitors,
        totalAttendees,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.', error: error.message });
  }
};

// Get All Users List
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
  }
};