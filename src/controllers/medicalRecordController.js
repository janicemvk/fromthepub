const MedicalRecord = require('../models/medicalRecord');

exports.createMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.findByPatientId(req.params.patientId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add more controller methods as needed