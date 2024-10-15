const httpStatus = require('http-status');
const ConversationService = require('../../../service/ConversationService');
const logger = require('../../../config/logger');

class ConversationController {
    constructor() {
        this.conversationService = new ConversationService();
    }

    createConversation = async (req, res) => {
        try {
            const response = await this.conversationService.createConversation(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    getConversations = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.conversationService.getConversationList(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateConversation = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.conversationService.updateConversation(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteConversation = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.conversationService.deleteConversation(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = ConversationController;
