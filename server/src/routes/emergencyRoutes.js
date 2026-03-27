const express = require('express');
const { triggerAlert, getActiveAlerts, resolveAlert, getMyActiveAlert } = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, authorize('Hospital Worker'), getActiveAlerts)
  .post(protect, authorize('Patient'), triggerAlert);

router.put('/:id/resolve', protect, authorize('Hospital Worker'), resolveAlert);

router.get('/my-active', protect, getMyActiveAlert);

module.exports = router;
