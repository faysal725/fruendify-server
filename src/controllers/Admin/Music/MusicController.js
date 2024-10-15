const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const MusicService = require('../../../service/Admin/MusicService');

class MusicController {
    constructor() {
        this.musicService = new MusicService();
    }

    getMusics = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.musicService.getMusicList(req);
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
            const response = await this.musicService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createMusic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.musicService.createMusic(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateMusic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.musicService.updateMusic(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteMusic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.musicService.deleteMusic(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleMusic = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.musicService.deleteMultipleMusic(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = MusicController;
