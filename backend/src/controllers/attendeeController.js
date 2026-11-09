
const mongoose = require('mongoose');

const User = require('../model/userSchema');
const Event = require('../model/event');
const Message = require('../model/messageSchema');
const Registration = require('../model/registrationSchema');

const OPEN_STATUSES = ['Upcoming', 'Live'];

const isOpenEvent = (event) => {
    return (
        OPEN_STATUSES.includes(event.status) &&
        new Date(event.endDate) >= new Date()
    );
};

// 1. Attendee Dashboard
exports.getDashboard = async (req, res) => {
    try {
        const attendeeId = req.user.id;

        const registrations = await Registration.find({
            attendee: attendeeId,
            status: 'registered'
        }).populate('event');

        const now = new Date();

        const upcomingRegistrations = registrations.filter(
            (registration) =>
                registration.event &&
                new Date(registration.event.startDate) >= now &&
                isOpenEvent(registration.event)
        );

        const availableEvents = await Event.countDocuments({
            status: { $in: OPEN_STATUSES },
            endDate: { $gte: now }
        });

        const unreadMessages = await Message.countDocuments({
            receiver: attendeeId,
            read: false
        });

        res.json({
            success: true,
            data: {
                totalTickets: registrations.length,
                upcomingEvents: upcomingRegistrations.length,
                availableEvents,
                unreadMessages,
                nextEvent: upcomingRegistrations[0]?.event || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Dashboard error',
            error: error.message
        });
    }
};

// 2. Browse Events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({
            status: { $in: OPEN_STATUSES },
            endDate: { $gte: new Date() }
        })
        .populate('hallId')
        .sort({ startDate: 1 });

        const registrations = await Registration.find({
            attendee: req.user.id,
            status: 'registered'
        });

        const registeredIds = registrations.map(
            (registration) => registration.event.toString()
        );

        const result = events.map((event) => ({
            ...event.toObject(),
            isRegistered: registeredIds.includes(event._id.toString())
        }));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Events error',
            error: error.message
        });
    }
};

// 3. Event Details
exports.getEventById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        const event = await Event.findById(req.params.id).populate('hallId');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const registration = await Registration.findOne({
            attendee: req.user.id,
            event: event._id,
            status: 'registered'
        });

        const registeredCount = await Registration.countDocuments({
            event: event._id,
            status: 'registered'
        });

        res.json({
            success: true,
            data: {
                ...event.toObject(),
                isRegistered: !!registration,
                registeredCount,
                canRegister: isOpenEvent(event) && !registration
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Event details error',
            error: error.message
        });
    }
};

// 4. Reserve a Free Pass
exports.registerForEvent = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (!isOpenEvent(event)) {
            return res.status(400).json({
                success: false,
                message: 'Registration is closed for this event'
            });
        }

        let registration = await Registration.findOne({
            attendee: req.user.id,
            event: event._id
        });

        if (registration && registration.status === 'registered') {
            return res.status(409).json({
                success: false,
                message: 'You are already registered'
            });
        }

        if (registration && registration.status === 'cancelled') {
            registration.status = 'registered';
            await registration.save();
        } else {
            registration = await Registration.create({
                attendee: req.user.id,
                event: event._id
            });
        }

        res.status(201).json({
            success: true,
            message: 'Pass reserved successfully',
            data: registration
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration error',
            error: error.message
        });
    }
};

// 5. My Tickets
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({
            attendee: req.user.id
        })
        .populate({
            path: 'event',
            populate: { path: 'hallId' }
        })
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: registrations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Tickets error',
            error: error.message
        });
    }
};

// 6. Cancel Registration
exports.cancelRegistration = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid registration ID'
            });
        }

        const registration = await Registration.findOne({
            _id: req.params.id,
            attendee: req.user.id
        }).populate('event');

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        if (registration.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Registration already cancelled'
            });
        }

        if (!registration.event || !isOpenEvent(registration.event)) {
            return res.status(400).json({
                success: false,
                message: 'This event is no longer open for cancellation'
            });
        }

        registration.status = 'cancelled';
        await registration.save();

        res.json({
            success: true,
            message: 'Registration cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Cancellation error',
            error: error.message
        });
    }
};

// 7. Get Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('name email role createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Profile error',
            error: error.message
        });
    }
};

// 8. Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name: name.trim() },
            { new: true, runValidators: true }
        ).select('name email role createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Profile update error',
            error: error.message
        });
    }
};
