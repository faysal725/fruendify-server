/* eslint-disable class-methods-use-this */
const Joi = require('joi');
const httpStatus = require('http-status');
const ApiError = require('../helper/ApiError');
const responseHandler = require('../helper/responseHandler');

class EducationValidator {
    async educationCreateValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            title: Joi.string().required(),
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

    async educationUpdateValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            educationUid: Joi.string().required(),
            title: Joi.string().required(),
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
            console.log(transformedError, 'transformedError');
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

    async educationUidValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            educationUid: Joi.string().required(),
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

    async educationUidsValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            educationUuids: Joi.array()
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

module.exports = EducationValidator;
