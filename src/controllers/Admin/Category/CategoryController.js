const httpStatus = require('http-status');
const logger = require('../../../config/logger');
const CategoryService = require('../../../service/Admin/CategoryService');

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
    }

    getCategorys = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.categoryService.getCategoryList(req);
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
            const response = await this.categoryService.getSpecificData(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    createCategory = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.categoryService.createCategory(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    updateCategory = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const user = await this.categoryService.updateCategory(req);
            const { status } = user.response;

            const { message, data } = user.response;
            res.status(user.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send(e);
        }
    };

    deleteCategory = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.categoryService.deleteCategory(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };

    deleteMultipleCategory = async (req, res) => {
        try {
            // eslint-disable-next-line no-underscore-dangle
            const response = await this.categoryService.deleteMultipleCategory(req);
            const { status } = response.response;

            const { message, data } = response.response;
            res.status(response.statusCode).send({ status, message, data });
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_REQUEST).send(e);
        }
    };
}

module.exports = CategoryController;
