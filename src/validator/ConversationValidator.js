/* eslint-disable class-methods-use-this */
const Joi = require('joi');
const httpStatus = require('http-status');
const responseHandler = require('../helper/responseHandler');

class ConversationValidator {
    async conversationCreateValidator(req, res, next) {
        const schema = Joi.object({
            eventUid: Joi.string().required(),
            message: Joi.string().allow('', null),
        });
        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.body, options);

        if (error) {
            const transformedError = {
                message: 'One or more field is required.',
                errors: {},
            };

            error.details.forEach((detail) => {
                const field = detail.path[0];
                const errorMessage = detail.message;

                if (!transformedError.errors[field]) {
                    transformedError.errors[field] = [];
                }

                transformedError.errors[field].push(errorMessage);
            });

            const responseData = responseHandler.returnError(
                httpStatus.BAD_REQUEST,
                transformedError,
            );
            return res.status(responseData.statusCode).send(responseData.response);
        }
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }

    async conversationUpdateValidator(req, res, next) {
        const schema = Joi.object({
            messageUid: Joi.string().required(),
            message: Joi.string().max(50).required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.body, options);

        if (error) {
            const transformedError = {
                message: 'One or more field is required.',
                errors: {},
            };

            error.details.forEach((detail) => {
                const field = detail.path[0];
                const errorMessage = detail.message;

                if (!transformedError.errors[field]) {
                    transformedError.errors[field] = [];
                }

                transformedError.errors[field].push(errorMessage);
            });

            const responseData = responseHandler.returnError(
                httpStatus.BAD_REQUEST,
                transformedError,
            );
            return res.status(responseData.statusCode).send(responseData.response);
        }
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }

    async conversationUidValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            conversationUid: Joi.string().required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.params, options);

        if (error) {
            const transformedError = {
                message: 'One or more field is required.',
                errors: {},
            };

            error.details.forEach((detail) => {
                const field = detail.path[0];
                const errorMessage = detail.message;

                if (!transformedError.errors[field]) {
                    transformedError.errors[field] = [];
                }

                transformedError.errors[field].push(errorMessage);
            });

            const responseData = responseHandler.returnError(
                httpStatus.BAD_REQUEST,
                transformedError,
            );
            return res.status(responseData.statusCode).send(responseData.response);
        }

        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}

module.exports = ConversationValidator;
