const express = require('express');
const patientController = require('../controllers/patientController');

const router = express.Router();

router.post('/', patientController.createPatient);
router.get('/:id', patientController.getPatient);

// Add more routes as needed

module.exports = router;
