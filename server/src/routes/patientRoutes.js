const express = require('express');
const { getPatientDetails, createOrUpdatePatientDetails } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, authorize('Patient'), getPatientDetails)
  .post(protect, authorize('Patient'), createOrUpdatePatientDetails);

module.exports = router;
