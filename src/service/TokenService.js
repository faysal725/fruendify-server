/* eslint-disable class-methods-use-this */
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');
const RedisService = require('./RedisService');
const Token = require('../models/Token');

class TokenService {
    constructor() {
        this.redisService = new RedisService();
        this.tokenDao = Token;
    }

    /**
     * Generate token
     * @param {string} uuid
     * @param {Moment} expires
     * @param {string} type
     * @param {string} [secret]
     * @returns {string}
     */

    generateToken = (uuid, expires, type, secret = config.jwt.secret) => {
        const payload = {
            sub: uuid,
            iat: moment().unix(),
            exp: expires.unix(),
            type,
        };
        return jwt.sign(payload, secret);
    };

    /**
     * Generate token
     * @param {string} uuid
     * @param {Moment} expires
     * @param {string} type
     * @param {string} [secret]
     * @returns {string}
     */

    generateAdminToken = (uuid, expires, type, secret = config.jwt.adminSecret) => {
        const payload = {
            sub: uuid,
            iat: moment().unix(),
            exp: expires.unix(),
            type,
        };
        return jwt.sign(payload, secret);
    };

    verifyToken = async (token, type) => {
        const payload = await jwt.verify(token, config.jwt.secret, (err, decoded) => {
            if (err) {
                throw new Error('Token not found');
            } else {
                // if everything is good, save to request for use in other routes
                return decoded;
            }
        });

        console.log('type', type);

        if (!payload) {
            throw new Error('Token not found');
        }
        return true;
    };

    verifyTokenAdmin = async (token, type) => {
        const payload = await jwt.verify(token, config.jwt.adminSecret, (err, decoded) => {
            if (err) {
                throw new Error('Token not found');
            } else {
                // if everything is good, save to request for use in other routes
                return decoded;
            }
        });

        console.log('type', type);

        if (!payload) {
            throw new Error('Token not found');
        }
        return true;
    };

    /**
     * Generate auth tokens
     * @param {{}} user
     * @returns {Promise<Object>}
     */
    generateAuthTokens = async (user) => {
        // eslint-disable-next-line no-underscore-dangle
        const userId = user._id;

        const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
        const accessToken = await this.generateToken(userId, accessTokenExpires, tokenTypes.ACCESS);
        const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
        const refreshToken = await this.generateToken(
            userId,
            refreshTokenExpires,
            tokenTypes.REFRESH,
        );
        const authTokens = [];
        authTokens.push({
            token: accessToken,
            user_uuid: userId,
            expires: accessTokenExpires.toDate(),
            type: tokenTypes.ACCESS,
            user_type: tokenTypes.USER,
            blacklisted: false,
        });
        authTokens.push({
            token: refreshToken,
            user_uuid: userId,
            expires: refreshTokenExpires.toDate(),
            type: tokenTypes.REFRESH,
            user_type: tokenTypes.USER,
            blacklisted: false,
        });

        const tokens = {
            access: {
                token: accessToken,
                expires: accessTokenExpires.toDate(),
            },
            refresh: {
                token: refreshToken,
                expires: refreshTokenExpires.toDate(),
            },
        };
        await this.saveMultipleTokens(authTokens);
        // await this.redisService.createTokens(user.uuid, tokens);

        return tokens;
    };

    /**
     * Generate auth tokens
     * @param {{}} user
     * @returns {Promise<Object>}
     */
    generateAdminAuthTokens = async (user) => {
        // eslint-disable-next-line no-underscore-dangle
        const userId = user._id;

        const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
        const accessToken = await this.generateAdminToken(
            userId,
            accessTokenExpires,
            tokenTypes.ACCESS,
        );
        const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
        const refreshToken = await this.generateAdminToken(
            userId,
            refreshTokenExpires,
            tokenTypes.REFRESH,
        );
        const authTokens = [];
        authTokens.push({
            token: accessToken,
            user_uuid: user.uuid,
            expires: accessTokenExpires.toDate(),
            type: tokenTypes.ACCESS,
            user_type: tokenTypes.ADMIN,
            blacklisted: false,
        });
        authTokens.push({
            token: refreshToken,
            user_uuid: user.uuid,
            expires: refreshTokenExpires.toDate(),
            type: tokenTypes.REFRESH,
            user_type: tokenTypes.ADMIN,
            blacklisted: false,
        });

        const tokens = {
            access: {
                token: accessToken,
                expires: accessTokenExpires.toDate(),
            },
            refresh: {
                token: refreshToken,
                expires: refreshTokenExpires.toDate(),
            },
        };
        await this.saveMultipleTokens(authTokens);
        // await this.redisService.createTokens(user.uuid, tokens);

        return tokens;
    };

    saveMultipleTokens = async (tokens) => {
        return this.tokenDao.insertMany(tokens);
    };
}

module.exports = TokenService;
