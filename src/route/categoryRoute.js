const express = require('express');

const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const CategoryController = require('../controllers/Admin/Category/CategoryController');
const CategoryValidator = require('../validator/CategoryValidator');

const categoryController = new CategoryController();
const categoryValidator = new CategoryValidator();

router.post(
    '/create',
    adminAuth(),
    categoryValidator.categoryCreateValidator,
    categoryController.createCategory,
);
router.post(
    '/update',
    adminAuth(),
    categoryValidator.categoryUpdateValidator,
    categoryController.updateCategory,
);
router.get('/list', adminAuth(), categoryController.getCategorys);
router.get('/details/:categoryUid', adminAuth(), categoryController.getSpecificData);
router.delete(
    '/delete/:categoryUid',
    adminAuth(),
    categoryValidator.categoryUidValidator,
    categoryController.deleteCategory,
);
router.post(
    '/delete/multiple',
    adminAuth(),
    categoryValidator.categoryUidsValidator,
    categoryController.deleteMultipleCategory,
);

module.exports = router;
