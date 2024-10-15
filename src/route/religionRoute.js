const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const ReligionController = require('../controllers/Admin/Religion/ReligionController');
const ReligionValidator = require('../validator/ReligionValidator');

const religionController = new ReligionController();
const religionValidator = new ReligionValidator();

router.post(
    '/create',
    adminAuth(),
    religionValidator.religionCreateValidator,
    religionController.createReligion,
);
router.post(
    '/update',
    adminAuth(),
    religionValidator.religionUpdateValidator,
    religionController.updateReligion,
);
router.get('/list', adminAuth(), religionController.getReligions);
router.get('/details/:religionUid', adminAuth(), religionController.getSpecificData);
router.delete(
    '/delete/:religionUid',
    adminAuth(),
    religionValidator.religionUidValidator,
    religionController.deleteReligion,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    religionValidator.religionUidsValidator,
    religionController.deleteMultipleReligion,
);

module.exports = router;
