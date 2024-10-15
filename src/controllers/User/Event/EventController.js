const httpStatus = require('http-status');
const EventService = require('../../../service/EventService');
const logger = require('../../../config/logger');

class EventController {
    constructor() {
        this.eventService = new EventService();
    }

    createEvent = async (req, res) => {
        try {
            const response = await this.eventService.createEvent(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getEvents = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getEventList(req);
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
            const response = await this.eventService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateEvent = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.eventService.updateEvent(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteEvent = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.deleteEvent(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    getEventCategory = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getEventCategoryList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    eventJoinRequest = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.eventJoinRequest(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getEventParticipentData = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getEventParticipentData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    eventParticipentStatusUpdate = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.eventParticipentStatusUpdate(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getMyEvent = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getMyEvent(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getJoinedEvent = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getJoinedEvent(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getEventGroup = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getEventGroup(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getUpComingEvent = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getUpComingEvent(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getDiscoverEvent = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getDiscoverEvent(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getSingleDiscoverEvent = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getSingleDiscoverEvent(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getEventParticipentRequest = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.getEventParticipentRequest(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    eventParticipentDelete = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.eventService.eventParticipentDelete(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    eventParticipentGroupStatusUpdate = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.eventService.eventParticipentGroupStatusUpdate(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    eventGroupStatusUpdate = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.eventService.eventGroupStatusUpdate(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };
}

module.exports = EventController;
