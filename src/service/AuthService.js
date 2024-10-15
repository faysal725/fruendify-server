const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const { default: axios } = require('axios');
const { tokenTypes } = require('../config/tokens');
const responseHandler = require('../helper/responseHandler');
const logger = require('../config/logger');
const RedisService = require('./RedisService');
const TokenService = require('./TokenService');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Token = require('../models/Token');

const { generateRandomNumber } = require('../helper/UtilityHelper');

class AuthService {
    constructor() {
        this.redisService = new RedisService();
        this.user = User;
        this.admin = Admin;
        this.tokenDao = Token;
        this.tokenService = new TokenService();
    }

    /**
     * Create a user
     * @param {String} email
     * @param {String} password
     * @returns {Promise<{response: {code: *, message: *, status: boolean}, statusCode: *}>}
     */
    loginWithEmailPassword = async (email, password) => {
        try {
            console.log(password, 'password');
            let message = 'Login Successful';
            let statusCode = httpStatus.OK;
            let user = await this.user.findOne({
                email,
                provider_id: null,
                email_registered: true,
            });

            if (user == null) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Invalid Email Address!',
                );
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            // const isPasswordValid = true;
            user = user.toJSON();

            delete user.password;

            if (!isPasswordValid) {
                statusCode = httpStatus.BAD_REQUEST;
                message = 'Wrong Password!';
                return responseHandler.returnError(statusCode, message);
            }

            return responseHandler.returnSuccess(statusCode, message, user);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Something Went Wrong!!');
        }
    };

    /**
     * Create a user
     * @param {String} email
     * @param {String} password
     * @returns {Promise<{response: {code: *, message: *, status: boolean}, statusCode: *}>}
     */
    adminLoginWithEmailPassword = async (email, password) => {
        try {
            console.log(password, 'password');
            let message = 'Login Successful';
            let statusCode = httpStatus.OK;
            let user = await this.admin.findOne({ email });

            if (user == null) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Invalid Email Address!',
                );
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            // const isPasswordValid = true;
            user = user.toJSON();

            delete user.password;

            if (!isPasswordValid) {
                statusCode = httpStatus.BAD_REQUEST;
                message = 'Wrong Password!';
                return responseHandler.returnError(statusCode, message);
            }

            return responseHandler.returnSuccess(statusCode, message, user);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Something Went Wrong!!');
        }
    };

    logout = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                req.token = token;
            } else {
                req.token = null;
            }
            const accessTokenDoc = await this.tokenDao.findOne({
                token: req.token,
                type: tokenTypes.ACCESS,
                user_type: tokenTypes.USER,
                blacklisted: false,
            });
            console.log(accessTokenDoc, 'refreshTokenDoc');

            if (!accessTokenDoc) {
                return responseHandler.returnError(
                    httpStatus.BAD_GATEWAY,
                    'Something Went Wrong!!',
                );
            }
            const del = await this.tokenDao.deleteOne({
                token: req.token,
                type: tokenTypes.ACCESS,
                user_type: tokenTypes.USER,
                blacklisted: false,
            });
            console.log(del, 'del');
            return responseHandler.returnSuccess(httpStatus.OK, 'Successfully logout', null);
        } catch (error) {
            logger.error(error);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Something Went Wrong!!');
        }
    };

    adminLogout = async (req, res) => {
        const refreshTokenDoc = await this.tokenDao.findOne({
            token: req.body.refresh_token,
            type: tokenTypes.REFRESH,
            user_type: tokenTypes.ADMIN,
            blacklisted: false,
        });
        if (!refreshTokenDoc) {
            return false;
        }
        await this.tokenDao.deleteOne({
            token: req.body.refresh_token,
            type: tokenTypes.REFRESH,
            user_type: tokenTypes.ADMIN,
            blacklisted: false,
        });
        await this.tokenDao.deleteOne({
            token: req.body.access_token,
            type: tokenTypes.ACCESS,
            user_type: tokenTypes.ADMIN,
            blacklisted: false,
        });
        return true;
    };

    /**
     * Create a user
     * @param {String} email
     * @param {String} password
     * @returns {Promise<{response: {code: *, message: *, status: boolean}, statusCode: *}>}
     */
    // eslint-disable-next-line class-methods-use-this
    googleLogin = async (req) => {
        try {
            const { GOOGLE_OAUTH_URL } = process.env;

            const { GOOGLE_CLIENT_ID } = process.env;
            const { GOOGLE_CALLBACK_URL } = process.env;

            const GOOGLE_OAUTH_SCOPES = [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ];

            const state = 'some_state';
            const scopes = encodeURIComponent(GOOGLE_OAUTH_SCOPES.join(' '));

            const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
                GOOGLE_CALLBACK_URL,
            )}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;

            return responseHandler.returnSuccess(
                200,
                'redirect url',
                GOOGLE_OAUTH_CONSENT_SCREEN_URL,
            );
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Something Went Wrong!!');
        }
    };

    /**
     * Create a user
     * @param {String} email
     * @param {String} password
     * @returns {Promise<{response: {code: *, message: *, status: boolean}, statusCode: *}>}
     */
    // eslint-disable-next-line class-methods-use-this
    googleCallback = async (req) => {
        try {
            const { GOOGLE_CLIENT_ID } = process.env;
            const { GOOGLE_CLIENT_SECRET } = process.env;

            const { GOOGLE_ACCESS_TOKEN_URL } = process.env;
            const { GOOGLE_CALLBACK_URL } = process.env;
            const { code } = req.body;
            const data = {
                code,

                client_id: GOOGLE_CLIENT_ID,

                client_secret: GOOGLE_CLIENT_SECRET,

                redirect_uri: GOOGLE_CALLBACK_URL,

                grant_type: 'authorization_code',
            };
            const stringifyData = JSON.stringify(data);
            console.log(stringifyData, 'stringifyData');
            const response = await axios.post(GOOGLE_ACCESS_TOKEN_URL, stringifyData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('====access_token_data====');
            console.log(response.data);
            console.log('====access_token_data====');
            // const accessTokenData = await response.json();
            console.log('====access_token_data====');
            // console.log(accessTokenData);
            console.log('====access_token_data====');
            let tokens = {};

            if (response.data) {
                const { id_token } = response.data;

                console.log(id_token, 'id_token');

                // verify and extract the information in the id token

                const tokenInfoResponse = await fetch(
                    // eslint-disable-next-line camelcase
                    `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`,
                );

                const mailData = await tokenInfoResponse.json();
                console.log('mailData');
                console.log(mailData);
                console.log('mailData');
                if (mailData && mailData.sub) {
                    let user = await this.user.findOne({ provider_id: mailData.sub });
                    console.log('user with provider_id');
                    console.log(user, 'user');
                    console.log('user with provider_id');

                    if (!user) {
                        const randomNumber = generateRandomNumber();
                        user = await this.user.create({
                            first_name: mailData.name ?? '',
                            email: mailData.email ?? '',
                            provider_id: mailData.sub,
                            password: '111111',
                            interests: [],
                            hobbies: [],
                            education: [],
                            diet: [],
                            languages: [],
                            industry: [],
                            registered_token: randomNumber,
                        });
                    }

                    if (user && user.email_registered) {
                        tokens = await this.tokenService.generateAuthTokens(user);
                        tokens.email = user.email;
                        // tokens.registered_token = user.registered_token;
                        return responseHandler.returnSuccess(200, 'logged in', { tokens });
                    }
                    // tokens = await this.tokenService.generateAuthTokens(user);
                    tokens.registered_token = user.registered_token;
                    // tokens.user = user;
                    tokens.email = user.email;
                    return responseHandler.returnSuccess(200, 'logged in', tokens);
                }

                const statusCode = httpStatus.OK;
                return responseHandler.returnSuccess(statusCode, 'logged in', { tokens });
            }

            const message = 'Login Successful';
            const statusCode = httpStatus.OK;
            return responseHandler.returnError(statusCode, 'failed', {});
        } catch (e) {
            logger.error(e.message);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Something Went Wrong!!');
        }
    };
}

module.exports = AuthService;
