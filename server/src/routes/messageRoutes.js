const express = require('express');
const { getMessagesByEmergency, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, sendMessage);

router.get('/:emergencyId', protect, getMessagesByEmergency);

module.exports = router;
