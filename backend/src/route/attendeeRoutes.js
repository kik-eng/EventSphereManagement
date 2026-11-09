
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/adminMiddleware');
const { attendeeOnly } = require('../middleware/attendeeMiddleware');
const attendeeController = require('../controllers/attendeeController');

// Protect all attendee routes
router.use(protect, attendeeOnly);

// Dashboard
router.get('/dashboard', attendeeController.getDashboard);

// Browse events
router.get('/events', attendeeController.getEvents);

// Event details
router.get('/events/:id', attendeeController.getEventById);

// Reserve a free pass
router.post('/events/:id/register', attendeeController.registerForEvent);

// My tickets
router.get('/registrations', attendeeController.getMyRegistrations);

// Cancel registration
router.delete('/registrations/:id', attendeeController.cancelRegistration);

// Profile
router.get('/profile', attendeeController.getProfile);
router.put('/profile', attendeeController.updateProfile);

module.exports = router;
