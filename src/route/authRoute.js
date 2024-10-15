const express = require('express');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/User/UserController');
const UserValidator = require('../validator/UserValidator');

const router = express.Router();
const auth = require('../middlewares/auth');

const authController = new AuthController();
const userController = new UserController();
const userValidator = new UserValidator();

router.get('/user', authController.getData);
router.post('/register', userValidator.userCreateValidator, authController.register);
router.post('/verify/otp', userValidator.otpEmailValidator, authController.emailVerifyWithToken);
router.post('/resend/otp', userValidator.emailValidator, authController.resendOtp);
router.post(
    '/forget/password/otp/send',
    userValidator.emailValidator,
    authController.forgetPasswordsendOtp,
);
router.post(
    '/forget/password/otp/verify',
    userValidator.forgetPasswordValidator,
    authController.resetForgetPasswordAndVerifyOtp,
);
router.post(
    '/registered/user/update',
    userValidator.registeredUserValidator,
    authController.updateRegisteredUser,
);
router.post('/email-exists', userValidator.checkEmailValidator, authController.checkEmail);
router.post('/login', userValidator.userLoginValidator, authController.login);
router.post('/google/login', authController.googleLogin);
router.post('/google/callback', authController.googleCallback);
router.post('/refresh-token', authController.refreshTokens);

router.post('/logout', auth(), authController.logout);

router.get('/profile', auth(), authController.getData);
router.post(
    '/update/profile',
    userValidator.userUpdateValidator,
    auth(),
    authController.updateAuthUser,
);
router.post(
    '/reset/password',
    userValidator.userResetPasswordValidator,
    auth(),
    authController.resetPassword,
);
router.post('/profile-image/update', auth(), authController.updateProfileImage);

router.post('/user-images/update', auth(), authController.updateUserImages);
router.post(
    '/profile/verify',
    userValidator.userImageValidator,
    auth(),
    authController.profileVerify,
);

router.post(
    '/send-friend-request',
    userValidator.toUserIdValidation,
    auth(),
    userController.sendFriendRequest,
);

router.post(
    '/accept-friend-request',
    userValidator.requestIdValidation,
    auth(),
    userController.acceptFriendRequest,
);

router.post(
    '/reject-friend-request',
    userValidator.requestIdValidation,
    auth(),
    userController.rejectFriendRequest,
);

router.get('/friends', auth(), userController.friends);
router.get('/get/next/friends', auth(), userController.getfriendsRequestNextList);
router.get('/friends/request', auth(), userController.getfriendsRequestList);

router.get('/favourites', auth(), userController.getFavouriteList);
router.get('/get/next/favourites', auth(), userController.getFavouriteNextList);

router.post(
    '/update/location',
    userValidator.userLocationUpdateValidator,
    auth(),
    authController.updateAuthUserLocation,
);

router.post(
    '/delete/user/image',
    userValidator.deleteUserImageValidator,
    auth(),
    authController.deleteAuthUserImage,
);

router.post(
    '/make-favorite',
    userValidator.makeFavouriteValidation,
    auth(),
    userController.makeFovourite,
);

module.exports = router;
