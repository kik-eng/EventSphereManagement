const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/adminMiddleware');
const { exhibitorOnly } = require('../middleware/exhibitorMiddleware');
const { uploadLogo, uploadDocuments } = require('../middleware/uploadMiddleware');
const c = require('../controllers/exhibitorController');

// Is file ke saare routes: login + exhibitor role zaroori
router.use(protect, exhibitorOnly);

// Dashboard
router.get('/dashboard', c.getDashboard);

// Profile
router.get('/profile', c.getProfile);
router.put('/profile', uploadLogo, c.updateProfile);

// Events + Applications
router.get('/events', c.getOpenEvents);
router.get('/applications', c.myApplications);
router.post('/applications', uploadDocuments, c.applyToEvent);
router.delete('/applications/:id', c.withdrawApplication);

// Floor plan + Booths
router.get('/events/:eventId/booths', c.getEventBooths);
router.get('/my-booths', c.getMyBooths);
router.post('/booths/:boothId/reserve', c.reserveBooth);
router.delete('/booths/:boothId/reserve', c.cancelReservation);
router.put('/booths/:boothId/details', c.updateBoothDetails);
router.get('/booths/:boothId/neighbors', c.getNeighbors);

module.exports = router;