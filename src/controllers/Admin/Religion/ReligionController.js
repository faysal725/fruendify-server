const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const ReligionService = require('../../../service/Admin/ReligionService');

class ReligionController {
    constructor() {
        this.religionService = new ReligionService();
    }

    getReligions = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.religionService.getReligionList(req);
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
            const response = await this.religionService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createReligion = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.religionService.createReligion(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateReligion = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.religionService.updateReligion(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteReligion = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.religionService.deleteReligion(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleReligion = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.religionService.deleteMultipleReligion(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = ReligionController;
