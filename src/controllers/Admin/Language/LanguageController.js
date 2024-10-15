const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const LanguageService = require('../../../service/Admin/LanguageService');

class LanguageController {
    constructor() {
        this.languageService = new LanguageService();
    }

    getLanguages = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.languageService.getLanguageList(req);
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
            const response = await this.languageService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createLanguage = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.languageService.createLanguage(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateLanguage = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.languageService.updateLanguage(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteLanguage = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.languageService.deleteLanguage(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleLanguage = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.languageService.deleteMultipleLanguage(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = LanguageController;
