const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const RoleController = require('../controllers/Admin/Role/RoleController');
const RoleValidator = require('../validator/RoleValidator');

const roleController = new RoleController();
const roleValidator = new RoleValidator();

router.post('/create', adminAuth(), roleValidator.roleCreateValidator, roleController.createRole);
router.post('/update', adminAuth(), roleValidator.roleUpdateValidator, roleController.updateRole);
router.post(
    '/module/create',
    adminAuth(),
    roleValidator.moduleCreateValidator,
    roleController.createModule,
);
router.get('/role/list', adminAuth(), roleController.getRoles);
router.get('/role/details/:roluUid', adminAuth(), roleController.getSpecificData);
router.get('/module/list', adminAuth(), roleController.getModules);
router.get('/permission/list', adminAuth(), roleController.getModules);
router.get('/module/seeder', adminAuth(), roleController.createModuleSeeder);
router.delete(
    '/delete/:roluUid',
    adminAuth(),
    roleValidator.roleUidValidator,
    roleController.deleteRole,
);

router.post(
    '/delete/multiple',
    adminAuth(),
    roleValidator.roleUidsValidator,
    roleController.deleteMultipleRole,
);

module.exports = router;
