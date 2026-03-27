const mongoose = require('mongoose');

const patientDetailsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  medicalHistory: { type: String },
  allergies: { type: String },
  emergencyContact: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('PatientDetails', patientDetailsSchema);
