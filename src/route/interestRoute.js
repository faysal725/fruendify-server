const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const InterestController = require('../controllers/Admin/Interest/InterestController');
const InterestValidator = require('../validator/InterestValidator');

const interestController = new InterestController();
const interestValidator = new InterestValidator();

router.post(
    '/create',
    adminAuth(),
    interestValidator.interestCreateValidator,
    interestController.createInterest,
);
router.post(
    '/update',
    adminAuth(),
    interestValidator.interestUpdateValidator,
    interestController.updateInterest,
);
router.get('/list', adminAuth(), interestController.getInterests);
router.get('/details/:interestUid', adminAuth(), interestController.getSpecificData);
router.delete(
    '/delete/:interestUid',
    adminAuth(),
    interestValidator.interestUidValidator,
    interestController.deleteInterest,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    interestValidator.interestUidsValidator,
    interestController.deleteMultipleInterest,
);
router.get('/public/list', interestController.getAllInterests);

module.exports = router;
