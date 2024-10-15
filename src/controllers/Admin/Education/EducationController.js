const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const EducationService = require('../../../service/Admin/EducationService');

class EducationController {
    constructor() {
        this.educationService = new EducationService();
    }

    getEducations = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.educationService.getEducationList(req);
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
            const response = await this.educationService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createEducation = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.educationService.createEducation(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateEducation = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.educationService.updateEducation(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteEducation = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.educationService.deleteEducation(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleEducation = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.educationService.deleteMultipleEducation(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = EducationController;
