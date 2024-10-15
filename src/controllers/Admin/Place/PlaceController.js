const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const PlaceService = require('../../../service/Admin/PlaceService');

class PlaceController {
    constructor() {
        this.PlaceService = new PlaceService();
    }

    getPlaces = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.PlaceService.getPlaceList(req);
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
            const response = await this.PlaceService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createPlace = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.PlaceService.createPlace(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updatePlace = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.PlaceService.updatePlace(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deletePlace = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.PlaceService.deletePlace(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultiplePlace = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.PlaceService.deleteMultiplePlace(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = PlaceController;
