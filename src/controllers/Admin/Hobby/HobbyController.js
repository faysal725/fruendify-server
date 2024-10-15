const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const HobbyService = require('../../../service/Admin/HobbyService');

class HobbyController {
    constructor() {
        this.hobbyService = new HobbyService();
    }

    getHobbies = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.hobbyService.getHobbyList(req);
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
            const response = await this.hobbyService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createHobby = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.hobbyService.createHobby(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateHobby = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.hobbyService.updateHobby(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteHobby = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.hobbyService.deleteHobby(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleHobby = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.hobbyService.deleteMultipleHobby(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = HobbyController;
