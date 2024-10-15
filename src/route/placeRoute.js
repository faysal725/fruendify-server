const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const PlaceController = require('../controllers/Admin/Place/PlaceController');
const PlaceValidator = require('../validator/PlaceValidator');

const placeController = new PlaceController();
const placeValidator = new PlaceValidator();

router.post(
    '/create',
    adminAuth(),
    placeValidator.placeCreateValidator,
    placeController.createPlace,
);
router.post(
    '/update',
    adminAuth(),
    placeValidator.placeUpdateValidator,
    placeController.updatePlace,
);
router.get('/list', adminAuth(), placeController.getPlaces);
router.get('/details/:placeUid', adminAuth(), placeController.getSpecificData);
router.delete(
    '/delete/:placeUid',
    adminAuth(),
    placeValidator.placeUidValidator,
    placeController.deletePlace,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    placeValidator.placeUidsValidator,
    placeController.deleteMultiplePlace,
);

module.exports = router;
