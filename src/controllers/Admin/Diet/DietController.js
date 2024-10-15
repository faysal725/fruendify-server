const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const DietService = require('../../../service/Admin/DietService');

class DietController {
    constructor() {
        this.dietService = new DietService();
    }

    getDiets = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.dietService.getDietList(req);
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
            const response = await this.dietService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createDiet = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.dietService.createDiet(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateDiet = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.dietService.updateDiet(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteDiet = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.dietService.deleteDiet(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleDiet = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.dietService.deleteMultipleDiet(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = DietController;
