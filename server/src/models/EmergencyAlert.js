const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientDetails', required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
