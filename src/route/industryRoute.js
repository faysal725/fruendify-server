const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const IndustryController = require('../controllers/Admin/Industry/IndustryController');
const IndustryValidator = require('../validator/IndustryValidator');

const industryController = new IndustryController();
const industryValidator = new IndustryValidator();

router.post(
    '/create',
    adminAuth(),
    industryValidator.industryCreateValidator,
    industryController.createIndustry,
);
router.post(
    '/update',
    adminAuth(),
    industryValidator.industryUpdateValidator,
    industryController.updateIndustry,
);
router.get('/list', industryController.getIndustrys);
router.get('/details/:industryUid', adminAuth(), industryController.getSpecificData);
router.delete(
    '/delete/:industryUid',
    adminAuth(),
    industryValidator.industryUidValidator,
    industryController.deleteIndustry,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    industryValidator.industryUidsValidator,
    industryController.deleteMultipleIndustry,
);

module.exports = router;
