const express = require('express');
const AuthController = require('../controllers/AuthController');
const UserValidator = require('../validator/UserValidator');

const router = express.Router();
const auth = require('../middlewares/auth');

const authController = new AuthController();
const userValidator = new UserValidator();

router.get(
    '/details',
    auth(),
    userValidator.userQueryIdValidator,
    authController.getSpecificUserData,
);

module.exports = router;
