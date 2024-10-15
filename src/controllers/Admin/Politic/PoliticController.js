const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const PoliticService = require('../../../service/Admin/PoliticService');

class PoliticController {
    constructor() {
        this.politicService = new PoliticService();
    }

    getPolitics = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.politicService.getPoliticList(req);
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
            const response = await this.politicService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createPolitic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.politicService.createPolitic(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updatePolitic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.politicService.updatePolitic(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deletePolitic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.politicService.deletePolitic(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultiplePolitic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.politicService.deleteMultiplePolitic(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = PoliticController;
