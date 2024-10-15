const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const AdminAuthController = require('../controllers/Admin/Auth/AdminAuthController');
const AdminUserValidator = require('../validator/AdminUserValidator');

const adminAuthController = new AdminAuthController();
const adminValidator = new AdminUserValidator();

router.post('/login', adminValidator.adminLoginValidator, adminAuthController.adminLogin);
router.post('/logout', adminAuthController.logout);
router.get('/profile', adminAuth(), adminAuthController.getAdminData);
router.post(
    '/create',
    adminAuth(),
    adminValidator.adminCreateValidator,
    adminAuthController.createStaff,
);
router.post(
    '/update',
    adminAuth(),
    adminValidator.adminUpdateValidator,
    adminAuthController.updateAdmin,
);
router.get('/list', adminAuth(), adminAuthController.getAdminList);
router.get('/specific/user/:userUid', adminAuth(), adminAuthController.getSpecificAdminData);
router.delete(
    '/delete/:userUid',
    adminAuth(),
    adminValidator.adminUidValidator,
    adminAuthController.deleteAdmin,
);

router.post(
    '/delete/multiple',
    adminAuth(),
    adminValidator.adminUidsValidator,
    adminAuthController.deleteMultipleAdmin,
);

router.post('/upload', adminAuth(), adminAuthController.uploadFile);

module.exports = router;
