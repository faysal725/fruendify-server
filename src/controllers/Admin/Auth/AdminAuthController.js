const httpStatus = require('http-status');
const AdminService = require('../../../service/Admin/AdminService');
const logger = require('../../../config/logger');
const TokenService = require('../../../service/TokenService');
const AuthService = require('../../../service/AuthService');

class AdminAuthController {
    constructor() {
        this.adminService = new AdminService();
        this.tokenService = new TokenService();
        this.authService = new AuthService();
    }

    getAdminData = async (req, res) => {
        try {
            console.log(process.env.PWD, 'process.env.PWD');
            // eslint-disable-next-line no-underscore-dangle
            const userId = req.user._id;
            const user = await this.adminService.getAdminData(userId);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getSpecificAdminData = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const userId = req.params.userUid;
            const user = await this.adminService.getAdminData(userId);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    adminLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await this.authService.adminLoginWithEmailPassword(
                email.toLowerCase(),
                password,
            );
            const { message } = user.response;
            const { data } = user.response;
            const { status } = user.response;
            const code = user.statusCode;

            let tokens = {};
            if (user.response.status) {
                tokens = await this.tokenService.generateAdminAuthTokens(data);
            }
            res.status(user.statusCode).send({ status, code, message, data, tokens });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    logout = async (req, res) => {
        await this.authService.adminLogout(req, res);
        res.status(httpStatus.NO_CONTENT).send();
    };

    createStaff = async (req, res) => {
        try {
            const user = await this.adminService.createStaff(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateAdmin = async (req, res) => {
        try {
            const user = await this.adminService.updateAdmin(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getAdminList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.adminService.getAdminList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteAdmin = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.adminService.deleteAdmin(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteMultipleAdmin = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.adminService.deleteMultipleAdmin(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    uploadFile = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.adminService.uploadFile(req, res);
            console.log(response, 'response');
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };
}

module.exports = AdminAuthController;
