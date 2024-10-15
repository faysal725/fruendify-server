/* eslint-disable class-methods-use-this */
const Joi = require('joi');
const httpStatus = require('http-status');
const ApiError = require('../helper/ApiError');
const responseHandler = require('../helper/responseHandler');

class PlaceValidator {
    async placeCreateValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            owner: Joi.string().required(),
            phone_number: Joi.string().required(),
            email: Joi.string().required(),
            place_name: Joi.string().required(),
            address_line: Joi.string().required(),
            lat: Joi.string().required(),
            long: Joi.string().required(),
            // interests: Joi.array().allow('', null),
            interests: Array.isArray(req.body.interests)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
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

    async placeUpdateValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            owner: Joi.string().required(),
            phone_number: Joi.string().required(),
            email: Joi.string().required(),
            place_name: Joi.string().required(),
            address_line: Joi.string().required(),
            lat: Joi.string().required(),
            long: Joi.string().required(),
            placeUid: Joi.string().required(),
            // interests: Joi.array().allow('', null),
            interests: Array.isArray(req.body.interests)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
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

    async placeUidValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            placeUid: Joi.string().required(),
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

    async placeUidsValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            placeUuids: Joi.array()
                .items(Joi.string().required()) // Each item in the array must be a string and is required
                .min(1) // Minimum number of items in the array should be 1
                .required(), // The array itself is required
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
            // on fail return comma separated errors
            const errorMessage = error.details
                .map((details) => {
                    return details.message;
                })
                .join(', ');
            next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
        } else {
            // on success replace req.body with validated value and trigger next middleware function
            req.body = value;
            return next();
        }
    }
}

module.exports = PlaceValidator;
