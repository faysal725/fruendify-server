const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const IndustryService = require('../../../service/Admin/IndustryService');

class IndustryController {
    constructor() {
        this.industryService = new IndustryService();
    }

    getIndustrys = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.industryService.getIndustryList(req);
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
            const response = await this.industryService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createIndustry = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.industryService.createIndustry(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateIndustry = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.industryService.updateIndustry(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteIndustry = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.industryService.deleteIndustry(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleIndustry = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.industryService.deleteMultipleIndustry(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = IndustryController;
