const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const RedisService = require('../service/RedisService');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Token = require('../models/Token');

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
};

const adminJwtOptions = {
    secretOrKey: config.jwt.adminSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
};

const jwtVerify = async (req, payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const userDao = User;
        const tokenDao = Token;
        const redisService = new RedisService();
        const authorization =
            req.headers.authorization !== undefined ? req.headers.authorization.split(' ') : [];
        if (authorization[1] === undefined) {
            return done(null, false);
        }

        let tokenDoc = await redisService.hasToken(authorization[1], 'access_token');
        if (!tokenDoc) {
            console.log('Cache Missed!');
            tokenDoc = await tokenDao.findOne({
                token: authorization[1],
                type: tokenTypes.ACCESS,
                user_type: tokenTypes.USER,
                blacklisted: false,
            });
        }

        if (!tokenDoc) {
            return done(null, false);
        }

        let user = await redisService.getUser(payload.sub);
        if (user) {
            user = new User(user);
        }

        if (!user) {
            user = await userDao.findById(payload.sub);
            // redisService.setUser(user);
        }

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        console.log(error);
        done(error, false);
    }
};

const adminJwtVerify = async (req, payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const adminDao = Admin;
        const tokenDao = Token;
        const redisService = new RedisService();
        const authorization =
            req.headers.authorization !== undefined ? req.headers.authorization.split(' ') : [];
        if (authorization[1] === undefined) {
            return done(null, false);
        }

        let tokenDoc = await redisService.hasToken(authorization[1], 'access_token');
        if (!tokenDoc) {
            console.log('Cache Missed!');
            tokenDoc = await tokenDao.findOne({
                token: authorization[1],
                type: tokenTypes.ACCESS,
                user_type: tokenTypes.ADMIN,
                blacklisted: false,
            });
        }

        if (!tokenDoc) {
            return done(null, false);
        }

        let user = await redisService.getUser(payload.sub);
        if (user) {
            user = new User(user);
        }

        if (!user) {
            user = await adminDao.findById(payload.sub);
            // redisService.setUser(user);
        }

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        console.log(error);
        done(error, false);
    }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

const adminJwtStrategy = new JwtStrategy(adminJwtOptions, adminJwtVerify);

module.exports = {
    jwtStrategy,
    adminJwtStrategy,
};
