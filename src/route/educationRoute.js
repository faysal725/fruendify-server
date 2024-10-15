const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const EducationController = require('../controllers/Admin/Education/EducationController');
const EducationValidator = require('../validator/EducationValidator');

const educationController = new EducationController();
const educationValidator = new EducationValidator();

router.post(
    '/create',
    adminAuth(),
    educationValidator.educationCreateValidator,
    educationController.createEducation,
);

router.post(
    '/update',
    adminAuth(),
    educationValidator.educationUpdateValidator,
    educationController.updateEducation,
);
router.get('/list', adminAuth(), educationController.getEducations);
router.get('/details/:educationUid', adminAuth(), educationController.getSpecificData);
router.delete(
    '/delete/:educationUid',
    adminAuth(),
    educationValidator.educationUidValidator,
    educationController.deleteEducation,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    educationValidator.educationUidsValidator,
    educationController.deleteMultipleEducation,
);

module.exports = router;
