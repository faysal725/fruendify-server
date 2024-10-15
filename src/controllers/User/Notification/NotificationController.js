const httpStatus = require('http-status');
const NotificationService = require('../../../service/NotificationService');
const logger = require('../../../config/logger');

class NotificationController {
    constructor() {
        this.notificationService = new NotificationService();
    }

    getNotificationList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.notificationService.getNotificationList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getUnreadNotificationList = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.notificationService.getUnreadNotificationList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateNotificationStatus = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.notificationService.updateNotificationStatus(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };
}

module.exports = NotificationController;
