let exp = require('express');
let router = exp.Router();
let adminRoute = require('./adminRoutes');
let exhibitorRoute = require('./exhibitorRoutes');
let attendeeRoute = require('./attendeeRoutes');
let authRoute = require('./authRoutes');
let floorPlanRoute = require('./floorPlanRoutes');
let messageRoute = require('./messageRoutes');

// Routes to access
router.use('/admin', adminRoute);
router.use('/exhibitor', exhibitorRoute);
router.use('/attendee', attendeeRoute);
router.use('/auth', authRoute);
router.use('/floor-plan', floorPlanRoute);
router.use('/messages', messageRoute);
module.exports = router;
