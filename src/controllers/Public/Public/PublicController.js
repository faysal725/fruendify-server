const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const PublicService = require('../../../service/public/PublicService');

class PublicController {
    constructor() {
        this.publicService = new PublicService();
    }

    getReligionList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getReligionList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getLanguageList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getLanguageList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getEducationList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getEducationList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getDietList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getDietList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getAllcategoryLists = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getAllcategoryLists(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getMusicList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getMusicList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getIndustryList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getIndustryList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };
    
    getPoliticList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.publicService.getPoliticList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };
}

module.exports = PublicController;
