const express = require('express');
const patientController = require('../../Controller/PatientController/PatientController');

const router = express.Router();

router.post('/patients', patientController.createPatient);
router.get('/patients/count', patientController.getPatientCount);
router.get('/patients', patientController.getPatient);
router.get('/patients/:id', patientController.getPatientById);
router.put('/patients/:id', patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

module.exports = router;