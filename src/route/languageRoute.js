const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const LanguageController = require('../controllers/Admin/Language/LanguageController');
const LanguageValidator = require('../validator/LanguageValidator');

const languageController = new LanguageController();
const languageValidator = new LanguageValidator();

router.post(
    '/create',
    adminAuth(),
    languageValidator.languageCreateValidator,
    languageController.createLanguage,
);
router.post(
    '/update',
    adminAuth(),
    languageValidator.languageUpdateValidator,
    languageController.updateLanguage,
);
router.get('/list', adminAuth(), languageController.getLanguages);
router.get('/details/:languageUid', adminAuth(), languageController.getSpecificData);
router.delete(
    '/delete/:languageUid',
    adminAuth(),
    languageValidator.languageUidValidator,
    languageController.deleteLanguage,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    languageValidator.languageUidsValidator,
    languageController.deleteMultipleLanguage,
);

module.exports = router;
