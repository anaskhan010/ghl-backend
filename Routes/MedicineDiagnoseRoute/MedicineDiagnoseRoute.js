const express = require('express');
const medicineDiagnoseController = require('../../Controller/MedicineDiagnoseController/MedicineDiagnoseController');

const router = express.Router();

router.post('/medicines', medicineDiagnoseController.createMedicine);
router.get('/medicines', medicineDiagnoseController.getMedicine);
router.get('/medicines/:id', medicineDiagnoseController.getMedicineById);
router.put('/medicines/:id', medicineDiagnoseController.updateMedicine);
router.delete('/medicines/:id', medicineDiagnoseController.deleteMedicine);

router.post('/diagnosis', medicineDiagnoseController.createDiagnosis);
router.get('/diagnosis', medicineDiagnoseController.getDiagnosis);
router.get('/diagnosis/:id', medicineDiagnoseController.getDiagnosisById);
router.put('/diagnosis/:id', medicineDiagnoseController.updateDiagnosis);
router.delete('/diagnosis/:id', medicineDiagnoseController.deleteDiagnosis);

router.post('/surgeries', medicineDiagnoseController.createSurgeries);
router.get('/surgeries', medicineDiagnoseController.getSurgeries);
router.get('/surgeries/:id', medicineDiagnoseController.getSurgeriesById);
router.put('/surgeries/:id', medicineDiagnoseController.updateSurgeries);
router.delete('/surgeries/:id', medicineDiagnoseController.deleteSurgeries);


router.get('/habits', medicineDiagnoseController.getHabits);


module.exports = router;