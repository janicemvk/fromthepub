const express = require('express');
const medicalRecordController = require('../controllers/medicalRecordController');

const router = express.Router();

router.post('/', medicalRecordController.createMedicalRecord);
router.get('/patient/:patientId', medicalRecordController.getPatientMedicalRecords);

// Add more routes as needed

module.exports = router;
