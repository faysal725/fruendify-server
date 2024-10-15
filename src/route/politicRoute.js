const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const PoliticController = require('../controllers/Admin/Politic/PoliticController');
const PoliticValidator = require('../validator/PoliticValidator');

const politicController = new PoliticController();
const politicValidator = new PoliticValidator();

router.post(
    '/create',
    adminAuth(),
    politicValidator.politicCreateValidator,
    politicController.createPolitic,
);
router.post(
    '/update',
    adminAuth(),
    politicValidator.politicUpdateValidator,
    politicController.updatePolitic,
);
router.get('/list', politicController.getPolitics);
router.get('/details/:politicUid', adminAuth(), politicController.getSpecificData);
router.delete(
    '/delete/:politicUid',
    adminAuth(),
    politicValidator.politicUidValidator,
    politicController.deletePolitic,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    politicValidator.politicUidsValidator,
    politicController.deleteMultiplePolitic,
);

module.exports = router;
