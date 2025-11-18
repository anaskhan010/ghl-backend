const express = require('express');
const patientController = require('../../Controller/PatientController/PatientController');
const upload = require('../../Config/multerConfig');

const router = express.Router();

router.post('/patients', upload.single('pre_screen_form'), patientController.createPatient);
router.get('/patients/count', patientController.getPatientCount);
router.get('/patients/leadSource', patientController.getpatientLeadSource);
router.get('/patients', patientController.getPatient);
router.get('/patients/:id', patientController.getPatientById);
router.put('/patients/:id', upload.single('pre_screen_form'), patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

module.exports = router;