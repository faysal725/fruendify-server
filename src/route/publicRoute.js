const express = require('express');
const PublicController = require('../controllers/Public/Public/PublicController');
const AuthController = require('../controllers/AuthController');
const UserValidator = require('../validator/UserValidator');

const router = express.Router();

const publicController = new PublicController();
const authController = new AuthController();
const userValidator = new UserValidator();

router.get('/religion', publicController.getReligionList);
router.get('/language', publicController.getLanguageList);
router.get('/education', publicController.getEducationList);
router.get('/diet', publicController.getDietList);
router.get('/categories', publicController.getAllcategoryLists);
router.get('/music', publicController.getMusicList);
router.get('/politic', publicController.getPoliticList);
router.get('/industry', publicController.getIndustryList);
router.get('/user/data', userValidator.userUidValidator, authController.getUserData);

module.exports = router;
