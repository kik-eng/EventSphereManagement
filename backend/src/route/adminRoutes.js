// const express = require('express');
// const router = express.Router();
// const { getAdminStats, getAllUsers, getAllEvents, createEvent } = require('../controllers/adminController');
// const { protect, adminOnly } = require('../middleware/adminMiddleware');

// Protected Admin Routes
// router.get('/stats', protect, adminOnly, getAdminStats);
// router.get('/users', protect, adminOnly, getAllUsers);

//admin aprroval/rejection for application
// const { getAllApplications, reviewApplication } = require('../controllers/adminapplicationController');
// router.get('/applications', protect, adminOnly, getAllApplications);
// router.put('/applications/:id/review', protect, adminOnly, reviewApplication);
// router.get('/events', protect, adminOnly, getAllEvents);
// router.post('/events', protect, adminOnly, createEvent);

// if (booth.status === 'reserved' && String(booth.assignedExhibitor) !== String(exhibitorId)) {
//   return res.status(400).json({ message: 'Booth is reserved by another exhibitor.' });
// }


// module.exports = router;

const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, getAllEvents, createEvent } = require('../controllers/adminController');
const { getAllApplications, reviewApplication,getBoothRequests, reviewBoothRequest } = 
require('../controllers/adminApplicationController');
const { protect, adminOnly } = require('../middleware/adminMiddleware');

router.get('/booth-requests', protect, adminOnly, getBoothRequests);
router.put('/booth-requests/:id/review', protect, adminOnly, reviewBoothRequest);
// Protected Admin Routes
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsers);

// Events
router.get('/events', protect, adminOnly, getAllEvents);
router.post('/events', protect, adminOnly, createEvent);

// Exhibitor applications
router.get('/applications', protect, adminOnly, getAllApplications);
router.put('/applications/:id/review', protect, adminOnly, reviewApplication);

module.exports = router;