const PatientDetails = require('../models/PatientDetails');

const getPatientDetails = async (req, res) => {
  try {
    const details = await PatientDetails.findOne({ user: req.user._id });
    if (!details) {
      return res.status(404).json({ message: 'No health details found' });
    }
    res.json(details);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createOrUpdatePatientDetails = async (req, res) => {
  const { age, bloodGroup, medicalHistory, allergies, emergencyContact } = req.body;

  try {
    let details = await PatientDetails.findOne({ user: req.user._id });

    if (details) {
      details.age = age;
      details.bloodGroup = bloodGroup;
      details.medicalHistory = medicalHistory;
      details.allergies = allergies;
      details.emergencyContact = emergencyContact;
      await details.save();
      res.json(details);
    } else {
      details = await PatientDetails.create({
        user: req.user._id,
        age,
        bloodGroup,
        medicalHistory,
        allergies,
        emergencyContact,
      });
      res.status(201).json(details);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getPatientDetails, createOrUpdatePatientDetails };
