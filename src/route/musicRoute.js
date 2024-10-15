const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const MusicController = require('../controllers/Admin/Music/MusicController');
const MusicValidator = require('../validator/MusicValidator');

const musicController = new MusicController();
const musicValidator = new MusicValidator();

router.post(
    '/create',
    adminAuth(),
    musicValidator.musicCreateValidator,
    musicController.createMusic,
);
router.post(
    '/update',
    adminAuth(),
    musicValidator.musicUpdateValidator,
    musicController.updateMusic,
);
router.get('/list', musicController.getMusics);
router.get('/details/:musicUid', adminAuth(), musicController.getSpecificData);
router.delete(
    '/delete/:musicUid',
    adminAuth(),
    musicValidator.musicUidValidator,
    musicController.deleteMusic,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    musicValidator.musicUidsValidator,
    musicController.deleteMultipleMusic,
);

module.exports = router;
