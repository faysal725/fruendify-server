const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const DietController = require('../controllers/Admin/Diet/DietController');
const DietValidator = require('../validator/DietValidator');

const dietController = new DietController();
const dietValidator = new DietValidator();

router.post('/create', adminAuth(), dietValidator.dietCreateValidator, dietController.createDiet);
router.post('/update', adminAuth(), dietValidator.dietUpdateValidator, dietController.updateDiet);
router.get('/list', adminAuth(), dietController.getDiets);
router.get('/details/:categoryUid', adminAuth(), dietController.getSpecificData);
router.delete(
    '/delete/:dietUid',
    adminAuth(),
    dietValidator.dietUidValidator,
    dietController.deleteDiet,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    dietValidator.dietUidsValidator,
    dietController.deleteDiet,
);

module.exports = router;
