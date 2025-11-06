const express = require('express');
const studyController = require('../../Controller/StudyController/StudyController');

const router = express.Router();

router.post('/studies', studyController.createStudy);
router.get('/studies/count', studyController.countStudies);
router.get('/studies', studyController.getStudy);
router.get('/studies/:id', studyController.getStudyById);
router.put('/studies/:id', studyController.updateStudy);
router.delete('/studies/:id', studyController.deleteStudy);
router.get('/ghl-users', studyController.getGHLUsers);

module.exports = router;