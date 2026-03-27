const EmergencyAlert = require('../models/EmergencyAlert');
const PatientDetails = require('../models/PatientDetails');
const User = require('../models/User');

const triggerAlert = async (req, res) => {
  const { location } = req.body;

  try {
    const patientDetails = await PatientDetails.findOne({ user: req.user._id });
    if (!patientDetails) {
      return res.status(400).json({ message: 'Please fill out health details first' });
    }

    const alert = await EmergencyAlert.create({
      patient: req.user._id,
      patientDetails: patientDetails._id,
      location,
    });

    const populatedAlert = await EmergencyAlert.findById(alert._id)
      .populate('patient', 'name')
      .populate('patientDetails');

    // Emit to all hospital workers via socket
    req.io.to('hospital_workers').emit('new_emergency', populatedAlert);

    res.status(201).json(populatedAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'Active' })
      .populate('patient', 'name')
      .populate('patientDetails')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    alert.status = 'Resolved';
    await alert.save();
    
    // Notify all workers and the specific patient room
    req.io.to('hospital_workers').emit('alert_resolved', alert._id);
    req.io.to(`emergency-${alert._id}`).emit('alert_resolved', alert._id);

    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyActiveAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findOne({ patient: req.user._id, status: 'Active' })
      .populate('patient', 'name')
      .populate('patientDetails');
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { triggerAlert, getActiveAlerts, resolveAlert, getMyActiveAlert };
