/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { ObjectId } = require('mongoose').Types;
const { default: mongoose } = require('mongoose');
const responseHandler = require('../helper/responseHandler');
const logger = require('../config/logger');
const { userConstant, verificationCodeConstant } = require('../config/constant');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Otp = require('../models/Otp');
const UserImage = require('../models/UserImage');
const FriendRequest = require('../models/FriendRequest');
const NotificationService = require('./NotificationService');

const {
    generateExpiryDate,
    generateRandomNumber,
    calculateProfileCompletion,
    calculateAge,
    mailTemplate,
    generateUniqueToken,
} = require('../helper/UtilityHelper');
const { prepareCommonQueryParams } = require('../helper/requestHandlerHelper');
const Favourite = require('../models/Favourite');

class UserService {
    constructor() {
        this.userDao = User;
        this.AdminDao = Admin;
        this.OtpDao = Otp;
        this.UserImageDao = UserImage;
        this.FriendRequestDao = FriendRequest;
        this.FavouriteDao = Favourite;
        this.notificationService = new NotificationService();
    }

    getData = async (uuid) => {
        const result = await this.userDao
            .findById(uuid)
            .select({ password: 0, images: 0 })
            .populate(['diet', 'languages', 'education', 'religion', 'interests']);
        const userImages = await this.UserImageDao.find({ user_uuid: uuid });
        // Combine the result and userImages into one object
        const combinedResult = {
            ...result.toObject(),
            userImages: userImages || null,
        };

        return responseHandler.returnSuccess(httpStatus.CREATED, 'message', combinedResult);
    };

    getAdminData = async (uuid) => {
        const result = await this.AdminDao.findById(uuid).select('-password');

        return responseHandler.returnSuccess(httpStatus.CREATED, 'message', result);
    };

    /**
     * Create a user
     * @param {Object} userBody
     * @returns {Object}
     */
    createUser = async (userBody) => {
        try {
            let message = 'Successfully Registered the account! Please Verify your email.';
            const existUser = await this.userDao.findOne({
                email: userBody.email,
                email_registered: true,
                provider_id: null,
            });
            if (existUser) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Email already taken');
            }

            if (
                await this.userDao.findOne({
                    email: userBody.email,
                    email_registered: false,
                })
            ) {
                await this.userDao.deleteOne({ email: userBody.email });
            }
            const randomNumber = generateRandomNumber();
            userBody.email = userBody.email.toLowerCase();
            userBody.password = bcrypt.hashSync(userBody.password, 8);
            userBody.status = userConstant.STATUS_ACTIVE;
            userBody.email_verified = userConstant.EMAIL_VERIFIED_FALSE;
            userBody.registered_token = randomNumber;

            let userData = await this.userDao.create(userBody);

            if (!userData) {
                message = 'Registration Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }

            // Generate opt and sent it via mail to user mail.
            await this.generateOptAndSendMail(userData);

            userData = userData.toJSON();
            delete userData.password;
            const expiryTime = generateExpiryDate();

            userData.expiryTime = expiryTime;

            return responseHandler.returnSuccess(httpStatus.CREATED, message, userData);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Update user data after user registration
     * @param {Object} userBody
     * @returns {Object}
     */
    updateRegisteredUser = async (req) => {
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Minumin one image is required.',
                );
            }

            if (!req.files?.profile_image) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Profile image is required.',
                );
            }

            let message = 'Successfully updated user information';
            const userBody = req.body;

            const userInfo = await this.userDao.findOne({
                email: userBody.email,
                registered_token: userBody.registered_token,
            });

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            let files = Array.isArray(req.files.images) ? req.files.images : [];

            if (!Array.isArray(req.files.images) && req.files.images) {
                files = [req.files.images] || [];
            }

            // Function to move a file
            const moveFile = (fileData) => {
                return new Promise((resolve, reject) => {
                    const uploadDir = path.join('public', 'uploads');

                    // Check if the directory exists
                    if (!fs.existsSync(uploadDir)) {
                        // Create the directory
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const fileName = uniqueSuffix + fileData.name;
                    const uploadPath = path.join(uploadDir, fileName);
                    fileData.mv(uploadPath, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(uploadPath);
                        }
                    });
                });
            };

            let profileImage = null;
            if (req.files?.profile_image) {
                profileImage = await moveFile(req.files?.profile_image);
                profileImage = UserService.getRelativePath(profileImage, 'public');
            }

            // Move all files
            Promise.all(
                files.map((fileData) => {
                    return moveFile(fileData);
                }),
            )
                .then(async (fileNames) => {
                    const baseDir = 'public';

                    // eslint-disable-next-line array-callback-return
                    const modifiedfileNames = fileNames.map((fileName) => {
                        return UserService.getRelativePath(fileName, baseDir);
                    });

                    let interests = [];

                    if (userBody.interests) {
                        interests = Array.isArray(userBody.interests)
                            ? userBody.interests
                            : userBody.interests?.split(',');
                    }
                    const where = { _id: userInfo._id };
                    const updateData = {
                        first_name: userBody.full_name,
                        birth_date: userBody.birth_date,
                        about_fruendify: userBody.aboutFrundify || null,
                        gender: userBody.gender,
                        interests,
                        job_title: userBody.jobTitle || null,
                        industry: Array.isArray(userBody) ? userBody.interests : null,
                        // industry: [] || null,
                        experience: userBody.experience || null,
                        job_description: userBody.jobDescription || null,
                        // images: modifiedfileNames,
                        profile_image: profileImage,
                        email_registered: true,
                        joining_reason: userBody.joining_reason || null,
                        description: userBody.description || null,
                    };

                    const userData = await this.userDao.updateOne(where, updateData);

                    if (!userData) {
                        message = 'Registration Failed! Please Try again.';
                        return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
                    }

                    // Create an array of objects to be inserted
                    const filesToInsert = modifiedfileNames.map((filePath) => {
                        return {
                            user_uuid: userInfo._id,
                            image: filePath,
                        };
                    });
                    const userImage = await this.UserImageDao.insertMany(filesToInsert);
                    const notificationData = {
                        user_uuid: userInfo._id,
                    };

                    await this.notificationService.setNotification(
                        'You have successfully registered',
                        req,
                        userInfo._id,
                        'GENERAL',
                        notificationData,
                    );
                    return responseHandler.returnSuccess(httpStatus.CREATED, message, null);
                })
                .catch((err) => {
                    console.log(' File upload failed', err);
                    return responseHandler.returnError(
                        httpStatus.BAD_REQUEST,
                        'Sorry! File upload failed',
                    );
                });

            return responseHandler.returnSuccess(httpStatus.CREATED, message, userInfo);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Get user
     * @param {String} email
     * @returns {Object}
     */

    isEmailExists = async (email) => {
        const message = 'Email found!';
        if (!(await this.userDao.isEmailExists(email))) {
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Email not Found!!');
        }
        return responseHandler.returnSuccess(httpStatus.OK, message);
    };

    getUserByUuid = async (uuid) => {
        return this.userDao.findById(uuid);
    };

    changePassword = async (data, uuid) => {
        let message = 'Login Successful';
        let statusCode = httpStatus.OK;
        // let user = await this.userDao.findOneByWhere({ uuid });
        let user = await this.userDao.findById(uuid);

        if (!user) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'User Not found!');
        }

        if (data.password !== data.confirm_password) {
            return responseHandler.returnError(
                httpStatus.BAD_REQUEST,
                'Confirm password not matched',
            );
        }

        const isPasswordValid = await bcrypt.compare(data.old_password, user.password);
        user = user.toJSON();
        delete user.password;
        if (!isPasswordValid) {
            statusCode = httpStatus.BAD_REQUEST;
            message = 'Wrong old Password!';
            return responseHandler.returnError(statusCode, message);
        }
        const updateUser = await this.userDao.findByIdAndUpdate(
            { uuid },
            { password: bcrypt.hashSync(data.password, 8) },
        );

        if (updateUser) {
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Password updated Successfully!',
                {},
            );
        }

        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Password Update Failed!');
    };

    generateOptAndSendMail = async (user) => {
        try {
            const token = await generateUniqueToken();
            // const token = 123456;
            const expiryTime = generateExpiryDate();
            const otpData = {
                otp: token,
                email: user.email,
                expired_time: expiryTime,
            };
            const response = await this.OtpDao.create(otpData);
            console.log(response, 'response');

            if (response) {
                const sendMail = await this.emailSend(otpData);
                console.log(sendMail, 'sendMail 11');
                return true;
            }

            return false;
        } catch (error) {
            logger.error(error);
            return false;
        }
    };

    emailVerifyWithToken = async (req) => {
        try {
            const { email, otp } = req.body;
            const message = 'Email verify with token successfully!';

            const where = {
                email,
                is_used: verificationCodeConstant.STATUS_NOT_USED,
                otp,
            };

            /// Check How many code send a day
            const tokenInfo = await this.OtpDao.findOne(where);

            if (!tokenInfo) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    'Verify email token is invalid',
                );
            }

            // Get the current time
            const currentTime = new Date();
            const userRecord = new Date(tokenInfo.expired_time);

            // Compare current time with expired_time
            if (currentTime > userRecord) {
                console.log('The OTP has expired.');
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'The OTP has expired.');
            }

            /// Email is verify is update in user table
            const whereUserData = { email };
            const dataUpdateUser = {
                email_verified: userConstant.EMAIL_VERIFIED_TRUE,
            };
            // const userResponse = await this.userDao.updateOne(whereUserData, dataUpdateUser);
            const userResponse = true;

            if (userResponse) {
                /// Token data update to used
                const data = {
                    is_used: verificationCodeConstant.STATUS_USED,
                };
                const whereData = {
                    _id: tokenInfo._id,
                };
                const response = await this.OtpDao.updateOne(whereData, data);

                if (response) {
                    return responseHandler.returnSuccess(httpStatus.OK, message);
                }
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Otp verify failed');
            }

            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Otp verify failed!');
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Otp verify failed!');
        }
    };

    emailSend = async (otpData) => {
        try {
            // Create a transporter object using the default SMTP transport
            const transporter = nodemailer.createTransport({
                // service: 'gmail',
                host: process.env.SENDER_MAIL_HOST,
                port: process.env.SENDER_MAIL_PORT,
                auth: {
                    user: process.env.SENDER_MAIL, // Replace with your email
                    pass: process.env.SENDER_MAIL_PASSWORD, // Replace with your email password
                },
            });

            // Email options
            const mailOptions = {
                from: process.env.SENDER_MAIL, // Sender address
                to: otpData.email, // List of recipients
                subject: 'Your Verification Code', // Subject line
                html: mailTemplate(otpData.otp), // HTML body
            };

            // Send email
            const sendMail = transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(`Error: ${error}`);
                }
                console.log(`Message Sent: ${info.response}`);
            });

            if (sendMail) {
                return true;
            }

            return false;
        } catch (error) {
            console.log('error in mail send');
            logger.error(error);
            return false;
        }
    };

    static getRelativePath(filePath, baseDir) {
        const absoluteBaseDir = path.resolve(baseDir);
        const absoluteFilePath = path.resolve(filePath);
        return path.relative(absoluteBaseDir, absoluteFilePath);
    }

    /**
     * Create a user
     * @param {Object} userBody
     * @returns {Object}
     */
    resendOtp = async (req) => {
        try {
            let message = 'Successfully sent otp! Please Verify your email.';

            const userData = { email: req.body?.email };
            // Generate opt and sent it via mail to user mail.
            const response = await this.generateOptAndSendMail(userData);

            if (response) {
                const expiryTime = generateExpiryDate();

                const finalResponse = {
                    expiryTime,
                };
                return responseHandler.returnSuccess(httpStatus.CREATED, message, finalResponse);
            }
            message = 'Otp send failed!';

            return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Update user data after user registration
     * @param {Object} userBody
     * @returns {Object}
     */
    updateAuthUser = async (req) => {
        try {
            let message = 'Successfully updated user information';
            let userBody = req.body;

            userBody = Object.fromEntries(
                Object.entries(userBody).filter(([key, value]) => {
                    return value !== null;
                }),
            );

            const userId = req.user._id;
            const userInfo = await this.userDao.findById(userId);

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            let smoke = userInfo?.smoke;

            if (typeof userBody.smoke !== 'undefined') {
                if (userBody.smoke === false) {
                    smoke = false;
                } else {
                    smoke = true;
                }
            }

            let sport = userInfo?.sport;

            if (typeof userBody.sport !== 'undefined') {
                if (userBody.sport === false) {
                    sport = false;
                } else {
                    sport = true;
                }
            }

            let drinks = userInfo?.drinks;

            if (typeof userBody.drinks !== 'undefined') {
                if (userBody.drinks === false) {
                    drinks = false;
                } else {
                    drinks = true;
                }
            }
            const where = { _id: userInfo._id };
            const updateData = {
                first_name: userBody.full_name || userInfo?.first_name,
                birth_date: userBody.birth_date || userInfo?.birth_date,
                gender: userBody.gender || userInfo?.gender,
                religion: userBody.religion || userInfo?.religion,
                education: userBody.education || userInfo?.education,
                maritial_status: userBody.maritial_status || userInfo?.maritial_status,
                smoke,
                drinks,
                diet: userBody.diet || userInfo?.diet,
                sport,
                height: userBody.height || userInfo?.height,
                languages: userBody.languages || userInfo?.languages,
                want_to_meet: userBody.want_to_meet || userInfo?.want_to_meet,
                description: userBody.description || userInfo?.description,
                interests: userBody.interests || userInfo?.interests,
                joining_reason: userBody.joining_reason || userInfo?.joining_reason,
            };

            const userData = await this.userDao.updateOne(where, updateData);

            if (!userData) {
                message = 'Update Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }
            const profileCompleted = calculateProfileCompletion(userInfo);
            userInfo.profile_completed = profileCompleted;
            userInfo.save();
            return responseHandler.returnSuccess(httpStatus.CREATED, message, null);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Update user profile data
     * @param {Object} userBody
     * @returns {Object}
     */
    updateProfileImage = async (req) => {
        try {
            let message = 'Successfully updated profile picture';

            if (!req.files?.profile_image) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Profile image is required.',
                );
            }

            const userId = req.user._id;
            const userInfo = await this.userDao.findById(userId);

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            // Function to move a file
            const moveFile = (fileData) => {
                return new Promise((resolve, reject) => {
                    const uploadDir = path.join('public', 'uploads');

                    // Check if the directory exists
                    if (!fs.existsSync(uploadDir)) {
                        // Create the directory
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const fileName = uniqueSuffix + fileData.name;
                    const uploadPath = path.join(uploadDir, fileName);
                    fileData.mv(uploadPath, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(uploadPath);
                        }
                    });
                });
            };

            let profileImage = null;
            if (req.files?.profile_image) {
                profileImage = await moveFile(req.files?.profile_image);
                profileImage = UserService.getRelativePath(profileImage, 'public');
            }

            const where = { _id: userId };
            const updateData = {
                profile_image: profileImage || userInfo?.profile_image,
                is_verified: false,
            };

            const userData = await this.userDao.updateOne(where, updateData);

            if (!userData) {
                message = 'Update Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }
            const updateUserInfo = await this.userDao.findById(userId);

            const profileCompleted = calculateProfileCompletion(updateUserInfo);
            userInfo.profile_completed = profileCompleted;
            userInfo.save();
            return responseHandler.returnSuccess(httpStatus.CREATED, message, null);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Update user profile data
     * @param {Object} userBody
     * @returns {Object}
     */
    updateUserImages = async (req) => {
        try {
            let message = 'Successfully updated user profile';

            if (!req.files?.images) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Minumin one image is required.',
                );
            }

            const userId = req.user._id;
            const userInfo = await this.userDao.findById(userId);

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            // Function to move a file
            const moveFile = (fileData) => {
                return new Promise((resolve, reject) => {
                    const uploadDir = path.join('public', 'uploads');

                    // Check if the directory exists
                    if (!fs.existsSync(uploadDir)) {
                        // Create the directory
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const fileName = uniqueSuffix + fileData.name;
                    const uploadPath = path.join(uploadDir, fileName);
                    fileData.mv(uploadPath, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(uploadPath);
                        }
                    });
                });
            };

            let files = Array.isArray(req.files.images) ? req.files.images : [];

            if (!Array.isArray(req.files.images) && req.files.images) {
                files = [req.files.images] || [];
            }

            // Move all files
            return await Promise.all(
                files.map((fileData) => {
                    return moveFile(fileData);
                }),
            )
                .then(async (fileNames) => {
                    const baseDir = 'public';

                    // eslint-disable-next-line array-callback-return
                    const modifiedfileNames = fileNames.map((fileName) => {
                        return UserService.getRelativePath(fileName, baseDir);
                    });
                    // Create an array of objects to be inserted
                    const filesToInsert = modifiedfileNames.map((filePath) => {
                        return {
                            user_uuid: userId,
                            image: filePath,
                        };
                    });
                    const userData = await this.UserImageDao.insertMany(filesToInsert);
                    if (!userData) {
                        message = 'Image upload failed! Please Try again.';
                        return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
                    }
                    const userImages = await this.UserImageDao.find({ user_uuid: userId });
                    return responseHandler.returnSuccess(httpStatus.CREATED, message, userImages);
                })
                .catch((err) => {
                    console.log(' File upload failed', err);
                    return responseHandler.returnError(
                        httpStatus.BAD_REQUEST,
                        'Sorry! File upload failed',
                    );
                });
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Update user data after user registration
     * @param {Object} userBody
     * @returns {Object}
     */
    resetPassword = async (req) => {
        try {
            let message = 'Password reset successfully';
            const userBody = req.body;

            const userId = req.user._id;
            const userInfo = await this.userDao.findById(userId);

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            // Compare the old password with the hashed password in the database
            const isMatch = bcrypt.compareSync(userBody?.old_password, userInfo.password);

            if (!isMatch) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Invalid old password',
                    null,
                );
            }

            const where = { _id: userInfo._id };
            const updateData = {
                password: userBody.password
                    ? bcrypt.hashSync(userBody.password, 8)
                    : userInfo?.password,
            };

            const userData = await this.userDao.updateOne(where, updateData);

            if (!userData) {
                message = 'Password reset failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }
            return responseHandler.returnSuccess(httpStatus.CREATED, message, null);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Create a user
     * @param {Object} userBody
     * @returns {Object}
     */
    forgetPasswordsendOtp = async (req) => {
        try {
            let message = 'Successfully sent otp! Please Verify your email.';

            const where = { email: req.body?.email, provider_id: null };
            const userInfo = await this.userDao.findOne(where);

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }
            // Generate opt and sent it via mail to user mail.
            const response = await this.generateOptAndSendMail(userInfo);

            if (response) {
                const expiryTime = generateExpiryDate();

                const finalResponse = {
                    expiryTime,
                };
                return responseHandler.returnSuccess(httpStatus.CREATED, message, finalResponse);
            }
            message = 'Otp send failed!';

            return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    resetForgetPasswordAndVerifyOtp = async (req) => {
        try {
            const { email, otp, password } = req.body;
            const message = 'Email verify with token successfully!';

            const where = {
                email,
                is_used: verificationCodeConstant.STATUS_NOT_USED,
                otp,
            };

            /// Check How many code send a day
            const tokenInfo = await this.OtpDao.findOne(where).sort({ createdAt: -1 });

            if (!tokenInfo) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    'Verify email token is invalid',
                );
            }

            const userInfo = await this.userDao.findOne({
                email: req.body?.email,
                provider_id: null,
            });

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            // Get the current time
            const currentTime = new Date();
            const userRecord = new Date(tokenInfo.expired_time);

            // Compare current time with expired_time
            if (currentTime > userRecord) {
                console.log('The OTP has expired.');
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'The OTP has expired.');
            }

            /// Email is verify is update in user table
            const whereUserData = { email };
            const dataUpdateUser = {
                email_verified: userConstant.EMAIL_VERIFIED_TRUE,
                password: password ? bcrypt.hashSync(password, 8) : userInfo?.password,
            };
            const userResponse = await this.userDao.updateOne(whereUserData, dataUpdateUser);

            if (userResponse) {
                /// Token data update to used
                const data = {
                    is_used: verificationCodeConstant.STATUS_USED,
                };
                const whereData = {
                    _id: tokenInfo._id,
                };
                const response = await this.OtpDao.updateOne(whereData, data);

                if (response) {
                    return responseHandler.returnSuccess(httpStatus.OK, message);
                }
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Otp verify failed');
            }

            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Otp verify failed!');
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Otp verify failed!');
        }
    };

    getUserData = async (uuid) => {
        const result = await this.userDao
            .findOne({ _id: uuid })
            .select({
                password: 0,
                images: 0,
                createdAt: 0,
                updatedAt: 0,
                email: 0,
                industry: 0,
                email_verified: 0,
                email_registered: 0,
                registered_token: 0,
                journey_mode: 0,
                stage_number: 0,
                profile_completed: 0,
                about_fruendify: 0,
                experience: 0,
            })
            .populate(['diet', 'languages', 'education', 'religion']);
        const userImages = await this.UserImageDao.find({ user_uuid: uuid });
        // Combine the result and userImages into one object
        const combinedResult = {
            ...result.toObject(),
            userImages: userImages || null,
        };

        return responseHandler.returnSuccess(httpStatus.CREATED, 'message', combinedResult);
    };

    profileVerify = async (req) => {
        try {
            const message = 'Successfully updated user profile';

            if (!req.body?.verify_image) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Minumin one image is required.',
                );
            }

            const userId = req.user._id;
            const userInfo = await this.userDao.findById(userId);

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            if (!userInfo?.profile_image) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Sorry! Profile image is required',
                );
            }

            const base64String = req.body?.verify_image;
            // const base64String = process.env.BASE_64;

            // Validate the Base64 string
            if (!base64String) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'No Base64 string provided',
                );
            }

            const domain = process.env.MAIN_DOMAIN;
            const profileImageUrl = domain + userInfo.profile_image;
            console.log('========profileImageUrl=========');
            console.log(profileImageUrl);
            console.log('========profileImageUrl=========');

            // const profileImageUrl =
            //     'http://64.226.107.168:5000/uploads/1720465799225-975785709ea46f90e-b3cd-4dae-bd43-79749be1010e.jpeg';

            const responseApi = await this.callFaceMatchApi(profileImageUrl, base64String);
            console.log(responseApi.data, 'responseApi');
            console.log('responseApi.status');
            console.log(responseApi.status);
            console.log('responseApi');

            if (responseApi.status === 200) {
                if (!responseApi.data.status) {
                    return responseHandler.returnError(
                        httpStatus.BAD_REQUEST,
                        'Image verification failed',
                    );
                }
            } else {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Image verification failed',
                );
            }

            const where = { _id: userId };
            const updateData = {
                is_verified: true,
            };

            const userData = await this.userDao.updateOne(where, updateData);
            console.log(userData, 'userData');

            const profileCompleted = calculateProfileCompletion(userInfo);
            userInfo.profile_completed = profileCompleted;
            userInfo.save();
            return responseHandler.returnSuccess(httpStatus.OK, 'Image verification succeeded', {});
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    moveBufferFile = async (filePath, buffer) => {
        // Write the file to the filesystem
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return responseHandler.returnSuccess(httpStatus.OK, 'Error writing file');
            }

            return responseHandler.returnSuccess(httpStatus.OK, 'Writing file successfully');
        });
    };

    callFaceMatchApi = async (targetImagePath, base64String) => {
        try {
            const form = new FormData();
            form.append('target', targetImagePath);
            form.append('challenge', base64String);

            const apiUrl = process.env.IMAGE_VERIFY_API;
            console.log('========apiUrl=========');
            console.log(apiUrl);
            console.log('========apiUrl=========');
            const response = await axios.post(apiUrl, form, {
                headers: {
                    ...form.getHeaders(),
                    Accept: 'application/json',
                },
                auth: {
                    username: process.env.USER_NAME, // Replace with your API username
                    password: process.env.PASSWORD, // Replace with your API password
                },
            });

            return response;
        } catch (error) {
            console.error('Error processing images:', error?.response?.status);
            return false;
        }
    };

    sendFriendRequest = async (req) => {
        try {
            let message = 'Friend request sent!';
            const { toUserId } = req.body;
            const fromUserId = req.user._id;

            const data = {
                from_user: fromUserId,
                to_user: toUserId,
            };

            const response = await this.FriendRequestDao.create(data);

            if (!response) {
                message = 'Friend request sent failed!';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }

            return responseHandler.returnSuccess(httpStatus.CREATED, message, response);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    acceptFriendRequest = async (req) => {
        try {
            const { requestId } = req.body;

            const request = await this.FriendRequestDao.findById(requestId);

            if (!request) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Friend request not found!',
                );
            }

            request.status = 'accepted';
            const response = await request.save();

            // Add each other as friends
            await this.userDao.findByIdAndUpdate(request.from_user, {
                $push: { friends: request.to_user },
            });
            await this.userDao.findByIdAndUpdate(request.to_user, {
                $push: { friends: request.from_user },
            });

            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Friend request accepted!',
                response,
            );
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    rejectFriendRequest = async (req) => {
        try {
            const { requestId } = req.body;

            const request = await this.FriendRequestDao.findById(requestId);

            if (!request) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Friend request not found!',
                );
            }

            const response = await request.deleteOne();

            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Friend request rejected!',
                response,
            );
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    friends = async (req) => {
        try {
            const userId = req.user._id;

            const friends = await this.FriendRequestDao.find({
                $or: [{ from_user: userId }, { to_user: userId }],
            });

            const user = await User.findById(userId).populate('friends', 'first_name email');

            if (!friends) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'User not found!');
            }

            return responseHandler.returnSuccess(httpStatus.CREATED, 'User found!', friends);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    getfriendList = async (req) => {
        const { page, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria
        const perPage = 30;
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $match: {
                    $or: [{ from_user: req.user._id }, { to_user: req.user._id }],
                    status: 'accepted',
                },
            },
            {
                $addFields: {
                    lookupUserId: {
                        $cond: {
                            if: { $ne: ['$from_user', req.user._id] },
                            then: '$from_user',
                            else: {
                                $cond: {
                                    if: { $ne: ['$to_user', req.user._id] },
                                    then: '$to_user',
                                    else: null,
                                },
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lookupUserId',
                    foreignField: '_id',
                    pipeline: [{ $project: { first_name: 1, email: 1, profile_image: 1 } }],
                    as: 'user',
                },
            },
            { $sort: orderBy },
        ];

        // Conditionally add $match stage if searchCriteria is not empty
        if (Object.keys(searchCriteria).length !== 0) {
            pipeline.push({
                $match: searchCriteria,
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                metaData: [
                    {
                        $count: 'totalDocuments',
                    },
                    {
                        $addFields: {
                            page,
                            perPage,
                        },
                    },
                ],
            },
        });

        const results = await this.FriendRequestDao.aggregate(pipeline);
        console.log(results, 'results');
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        // Return results along with metadata
        const responseData = {
            data: results[0].data,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Category data found', responseData);
    };

    getfriendsRequestList = async (req) => {
        const { page, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria
        const perPage = 30;
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $match: {
                    $or: [{ from_user: req.user._id }, { to_user: req.user._id }],
                    status: 'pending',
                },
            },
            {
                $addFields: {
                    lookupUserId: {
                        $cond: {
                            if: { $ne: ['$from_user', req.user._id] },
                            then: '$from_user',
                            else: {
                                $cond: {
                                    if: { $ne: ['$to_user', req.user._id] },
                                    then: '$to_user',
                                    else: null,
                                },
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lookupUserId',
                    foreignField: '_id',
                    pipeline: [{ $project: { first_name: 1, email: 1, profile_image: 1 } }],
                    as: 'user',
                },
            },
            { $sort: orderBy },
        ];

        // Conditionally add $match stage if searchCriteria is not empty
        if (Object.keys(searchCriteria).length !== 0) {
            pipeline.push({
                $match: searchCriteria,
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                metaData: [
                    {
                        $count: 'totalDocuments',
                    },
                    {
                        $addFields: {
                            page,
                            perPage,
                        },
                    },
                ],
            },
        });

        const results = await this.FriendRequestDao.aggregate(pipeline);
        console.log(results, 'results');
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        // Return results along with metadata
        const responseData = {
            data: results[0].data,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Category data found', responseData);
    };

    getfriendsRequestNextList = async (req) => {
        const { page, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria
        const perPage = 1;
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $match: {
                    $or: [{ from_user: req.user._id }, { to_user: req.user._id }],
                    status: 'accepted',
                },
            },
            {
                $addFields: {
                    lookupUserId: {
                        $cond: {
                            if: { $ne: ['$from_user', req.user._id] },
                            then: '$from_user',
                            else: {
                                $cond: {
                                    if: { $ne: ['$to_user', req.user._id] },
                                    then: '$to_user',
                                    else: null,
                                },
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lookupUserId',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                first_name: 1,
                                email: 1,
                                profile_image: 1,
                                birth_date: 1,
                                location: 1,
                                description: 1,
                                interests: 1,
                            },
                        },
                    ],
                    as: 'user',
                },
            },
            { $sort: orderBy },
        ];

        // Conditionally add $match stage if searchCriteria is not empty
        if (Object.keys(searchCriteria).length !== 0) {
            pipeline.push({
                $match: searchCriteria,
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                metaData: [
                    {
                        $count: 'totalDocuments',
                    },
                    {
                        $addFields: {
                            page,
                            perPage,
                        },
                    },
                ],
            },
        });

        const results = await this.FriendRequestDao.aggregate(pipeline);
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        const modifiedResult = await Promise.all(
            results[0].data.map(async (data) => {
                let age = 'unknown';
                if (data.user[0].birth_date) {
                    age = calculateAge(data.user[0].birth_date);
                }
                const distance = this.calculateDistance(
                    req?.user?.location?.coordinates,
                    data.user[0].location.coordinates,
                );

                let isFavourite = false;
                isFavourite = await this.FavouriteDao.findOne({
                    from_user: req.user._id,
                    to_user: data.user[0]._id,
                });

                const favouriteCount = await this.FavouriteDao.countDocuments({
                    to_user: data.user[0]._id,
                });
                // Combine the result and userImages into one object
                const combinedResult = {
                    ...data,
                    age,
                    distance,
                    isFavourite: !!isFavourite, // Convert to boolean
                    favouriteCount,
                };
                return combinedResult;
            }),
        );
        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        // Return results along with metadata
        const responseData = {
            data: modifiedResult,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Category data found', responseData);
    };

    isFavourite = async (authUserId, toUser) => {
        let isFavourite = false;
        isFavourite = await this.FavouriteDao.findOne({
            from_user: authUserId,
            to_user: toUser,
        });
        return isFavourite;
    };

    // eslint-disable-next-line class-methods-use-this
    calculatePaginationMetadata = (results, perPage) => {
        let totalDocuments = 0; // Initialize totalDocuments with 0

        if (results[0].metaData && results[0].metaData.length > 0) {
            totalDocuments = results[0].metaData[0].totalDocuments; // Update totalDocuments if metaData is defined
        }

        const totalPages = Math.ceil(totalDocuments / perPage);

        return {
            totalDocuments,
            totalPages,
        };
    };

    /**
     * Update user data after user registration
     * @param {Object} userBody
     * @returns {Object}
     */
    updateAuthUserLocation = async (req) => {
        try {
            let message = 'Successfully updated user location';
            const userBody = req.body;

            const userId = req.user._id;
            const userInfo = await this.userDao.findById(userId);

            if (!userInfo) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Sorry! User not found');
            }

            const where = { _id: userInfo._id };

            const updateData = {
                location: {
                    type: 'Point',
                    coordinates: [userBody.longitude, userBody.latitude],
                },
                road: userBody.road || userInfo?.road,
                city: userBody.city || userInfo?.city,
                country: userBody.country || userInfo?.country,
                timezone: userBody.timezone || userInfo?.timezone,
            };

            const userData = await this.userDao.updateOne(where, updateData);

            if (!userData) {
                message = 'Update Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }
            return responseHandler.returnSuccess(httpStatus.CREATED, message, null);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    /**
     * Update user data after user registration
     * @param {Object} userBody
     * @returns {Object}
     */
    deleteAuthUserImage = async (req) => {
        try {
            let message = 'Successfully deleted user image';
            const { imageUid } = req.body;

            const where = {
                _id: new ObjectId(imageUid),
                user_uuid: req.user._id,
            };

            const userData = await this.UserImageDao.deleteOne(where);

            if (!userData) {
                message = 'Delete Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }
            return responseHandler.returnSuccess(httpStatus.CREATED, message, null);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    getSpecificUserData = async (req) => {
        const uuid = req.query.userId;
        const authUser = await this.userDao.findOne({ _id: req.user._id }).select({
            email: 1,
            profile_image: 1,
            first_name: 1,
            last_name: 1,
            birth_date: 1,
            location: 1,
        });
        let userInfo = await this.userDao
            .findOne({ _id: uuid })
            .select({
                email: 1,
                profile_image: 1,
                first_name: 1,
                last_name: 1,
                birth_date: 1,
                location: 1,
                interests: 1,
                sport: 1,
                gender: 1,
                job_description: 1,
                job_title: 1,
                description: 1,
                want_to_meet: 1,
                is_verified: 1,
            })
            .populate(['diet', 'languages', 'education', 'religion', 'hobbies']);

        let isFriend = false;
        isFriend = await this.FriendRequestDao.findOne({
            status: 'accepted',
            from_user: req.user._id,
            to_user: uuid,
        });

        if (!isFriend) {
            isFriend = await this.FriendRequestDao.findOne({
                status: 'accepted',
                from_user: uuid,
                to_user: req.user._id,
            });
        }

        let isFavourite = false;
        isFavourite = await this.FavouriteDao.findOne({
            from_user: req.user._id,
            to_user: uuid,
        });

        const favouriteCount = await this.FavouriteDao.countDocuments({ to_user: uuid });

        let distance = 'Distance not found';
        if (authUser.location.coordinates && userInfo.location.coordinates) {
            distance = this.calculateDistance(
                authUser.location.coordinates,
                userInfo.location.coordinates,
            );
        }

        let age = 'unknown';
        if (userInfo.birth_date) {
            age = calculateAge(userInfo.birth_date);
        }
        userInfo = userInfo.toObject();
        const userImages = await this.UserImageDao.find({ user_uuid: uuid });

        // userInfo.delete('location');
        // Combine the result and userImages into one object
        const combinedResult = {
            ...userInfo,
            isFriend: !!isFriend,
            age,
            distance,
            userImages,
            isFavourite: !!isFavourite,
            favouriteCount,
        };

        return responseHandler.returnSuccess(httpStatus.CREATED, 'message', combinedResult);
    };

    toRadians = (degrees) => {
        return degrees * (Math.PI / 180);
    };

    calculateDistance = (coord1, coord2) => {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    };

    makeFovourite = async (req) => {
        try {
            let message = 'Successfully added in favourites';
            const { toUserId, isFavourite } = req.body;
            const fromUserId = req.user._id;

            const data = {
                from_user: fromUserId,
                to_user: toUserId,
            };

            let response = null;

            if (!isFavourite) {
                response = await this.FavouriteDao.deleteOne(data);
            } else {
                const favourite = await this.FavouriteDao.findOne(data); //

                if (favourite) {
                    return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Already exist!');
                }
                response = await this.FavouriteDao.create(data);
            }

            if (!response) {
                message = 'Friend request sent failed!';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }

            return responseHandler.returnSuccess(httpStatus.CREATED, message, response);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    getFavouriteList = async (req) => {
        const { page, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria
        const perPage = 30;
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $match: {
                    from_user: req.user._id,
                },
            },
            {
                $lookup: {
                    from: 'interests',
                    localField: 'interests',
                    foreignField: '_id',
                    as: 'interests',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'to_user',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                first_name: 1,
                                email: 1,
                                profile_image: 1,
                                birth_date: 1,
                                location: 1,
                                description: 1,
                                interests: 1,
                            },
                        },
                        {
                            $lookup: {
                                from: 'interests',
                                localField: 'interests',
                                foreignField: '_id',
                                as: 'interests',
                            },
                        },
                        {
                            $addFields: {
                                interests: '$interests',
                            },
                        },
                    ],
                    as: 'user',
                },
            },
            { $sort: orderBy },
        ];

        // Conditionally add $match stage if searchCriteria is not empty
        if (Object.keys(searchCriteria).length !== 0) {
            pipeline.push({
                $match: searchCriteria,
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                metaData: [
                    {
                        $count: 'totalDocuments',
                    },
                    {
                        $addFields: {
                            page,
                            perPage,
                        },
                    },
                ],
            },
        });

        const results = await this.FavouriteDao.aggregate(pipeline);
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        const modifiedResult = await Promise.all(
            results[0].data.map(async (data) => {
                let age = 'unknown';
                if (data.user[0].birth_date) {
                    age = calculateAge(data.user[0].birth_date);
                }
                const distance = this.calculateDistance(
                    req?.user?.location?.coordinates,
                    data.user[0].location.coordinates,
                );

                let isFavourite = false;
                isFavourite = await this.FavouriteDao.findOne({
                    from_user: req.user._id,
                    to_user: data.user[0]._id,
                });

                const favouriteCount = await this.FavouriteDao.countDocuments({
                    to_user: data.user[0]._id,
                });
                // Combine the result and userImages into one object
                const combinedResult = {
                    ...data,
                    age,
                    distance,
                    isFavourite: !!isFavourite, // Convert to boolean
                    favouriteCount,
                };
                return combinedResult;
            }),
        );
        // Return results along with metadata
        const responseData = {
            data: modifiedResult,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Favourite list found', responseData);
    };

    getFavouriteNextList = async (req) => {
        const { page, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria
        const perPage = 30;
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $match: {
                    from_user: req.user._id,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'to_user',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                first_name: 1,
                                email: 1,
                                profile_image: 1,
                                birth_date: 1,
                                location: 1,
                                description: 1,
                                interests: 1,
                            },
                        },
                        {
                            $lookup: {
                                from: 'interests',
                                localField: 'interests',
                                foreignField: '_id',
                                as: 'interests',
                            },
                        },
                        {
                            $addFields: {
                                interests: '$interests',
                            },
                        },
                    ],
                    as: 'user',
                },
            },
            { $sort: orderBy },
        ];

        // Conditionally add $match stage if searchCriteria is not empty
        if (Object.keys(searchCriteria).length !== 0) {
            pipeline.push({
                $match: searchCriteria,
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                metaData: [
                    {
                        $count: 'totalDocuments',
                    },
                    {
                        $addFields: {
                            page,
                            perPage,
                        },
                    },
                ],
            },
        });

        const results = await this.FavouriteDao.aggregate(pipeline);
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        const modifiedResult = await Promise.all(
            results[0].data.map(async (data) => {
                let age = 'unknown';
                if (data.user[0].birth_date) {
                    age = calculateAge(data.user[0].birth_date);
                }
                const distance = this.calculateDistance(
                    req?.user?.location?.coordinates,
                    data.user[0].location.coordinates,
                );

                let isFavourite = false;
                isFavourite = await this.FavouriteDao.findOne({
                    from_user: req.user._id,
                    to_user: data.user[0]._id,
                });

                const favouriteCount = await this.FavouriteDao.countDocuments({
                    to_user: data.user[0]._id,
                });
                // Combine the result and userImages into one object
                const combinedResult = {
                    ...data,
                    age,
                    distance,
                    isFavourite: !!isFavourite, // Convert to boolean
                    favouriteCount,
                };
                return combinedResult;
            }),
        );
        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        // Return results along with metadata
        const responseData = {
            data: modifiedResult,
            metadata,
        };
        return responseHandler.returnSuccess(
            httpStatus.OK,
            'Next favourite data found',
            responseData,
        );
    };
}

module.exports = UserService;
