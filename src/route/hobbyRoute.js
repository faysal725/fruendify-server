const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const HobbyController = require('../controllers/Admin/Hobby/HobbyController');
const HobbyValidator = require('../validator/HobbyValidator');

const hobbyController = new HobbyController();
const hobbyValidator = new HobbyValidator();

router.post(
    '/create',
    adminAuth(),
    hobbyValidator.hobbyCreateValidator,
    hobbyController.createHobby,
);
router.post(
    '/update',
    adminAuth(),
    hobbyValidator.hobbyUpdateValidator,
    hobbyController.updateHobby,
);
router.get('/list', adminAuth(), hobbyController.getHobbies);
router.get('/details/:hobbyUid', adminAuth(), hobbyController.getSpecificData);
router.delete(
    '/delete/:hobbyUid',
    adminAuth(),
    hobbyValidator.hobbyUidValidator,
    hobbyController.deleteHobby,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    hobbyValidator.hobbyUidsValidator,
    hobbyController.deleteMultipleHobby,
);

module.exports = router;
