const httpStatus = require('http-status');
const AdminService = require('../../../service/Admin/AdminService');
const logger = require('../../../config/logger');
const RoleService = require('../../../service/Admin/RoleService');

class RoleController {
    constructor() {
        this.adminService = new AdminService();
        this.roleService = new RoleService();
    }

    getRoles = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.roleService.getRoleList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getSpecificData = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.roleService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getModules = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.roleService.getModuleList();
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getPermissions = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.roleService.getModuleList();
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createRole = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.roleService.createRole(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateRole = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.roleService.updateRole(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createModule = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.roleService.createModule(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createModuleSeeder = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.roleService.createModuleSeeder();

            res.status(200).send('Seeder run successfully');
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteRole = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.roleService.deleteRole(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteMultipleRole = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.roleService.deleteMultipleRole(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };
}

module.exports = RoleController;
