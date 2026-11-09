const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/adminMiddleware');
const m = require('../controllers/messageController');

// Messaging sab roles ke liye (admin, exhibitor, attendee) - sirf login chahiye
router.use(protect);

router.get('/', m.getInbox);
router.get('/support/admin', m.getSupportAdmin); // ':userId' se pehle rakhna zaroori hai
router.get('/:userId', m.getConversation);
router.post('/', m.sendMessage);

module.exports = router;