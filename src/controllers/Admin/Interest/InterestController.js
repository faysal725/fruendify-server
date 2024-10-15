const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const InterestService = require('../../../service/Admin/InterestService');

class InterestController {
    constructor() {
        this.interestService = new InterestService();
    }

    getInterests = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.interestService.getInterestList(req);
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
            const response = await this.interestService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createInterest = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.interestService.createInterest(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateInterest = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.interestService.updateInterest(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteInterest = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.interestService.deleteInterest(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleInterest = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.interestService.deleteMultipleInterest(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    getAllInterests = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.interestService.getAllInterests();
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };
}

module.exports = InterestController;
