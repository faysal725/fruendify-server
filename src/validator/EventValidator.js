/* eslint-disable class-methods-use-this */
const Joi = require('joi');
const httpStatus = require('http-status');
const responseHandler = require('../helper/responseHandler');

class EventValidator {
    async eventCreateValidator(req, res, next) {
        const {
            interests,
            category,
            religion,
            politic,
            music,
            hobbies,
            education,
            language,
            diet,
            carrier,
        } = req.body;
        const schema = Joi.object({
            title: Joi.string().max(50).required(),
            short_description: Joi.string().allow('', null),
            event_date: Joi.string().allow('', null),
            number_of_people: Joi.number().allow('', null),
            start_time: Joi.string().required(),
            notice_hour: Joi.allow('', null),
            notice_hour_slot: Joi.string().allow('', null),
            user_uid: Joi.string().allow('', null),
            interests: Array.isArray(interests)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            language: Array.isArray(language)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            education: Array.isArray(education)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            hobbies: Array.isArray(hobbies)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            music: Array.isArray(music)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            politic: Array.isArray(politic)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            religion: Array.isArray(religion)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            category: Array.isArray(category)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            address: Joi.string().allow('', null),
            lat: Joi.number().allow('', null),
            long: Joi.number().allow('', null),
            gender: Joi.string()
                .valid('Male', 'Female', 'Non-binary', 'Others', 'All')
                .allow('', null),
            start_age: Joi.number().allow('', null),
            end_age: Joi.number().allow('', null),
            diet: Array.isArray(diet) ? Joi.array().allow('', null) : Joi.string().allow('', null),
            carrier: Array.isArray(carrier)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            city: Joi.string().allow('', null),
            country: Joi.string().allow('', null),
            relationship_status: Joi.string().allow('', null),
            drink: Joi.string().allow('', null),
            is_athlete: Joi.boolean().default(false),
            smoke: Joi.string().allow('', null),
            face_blur: Joi.boolean().default(false),
            status: Joi.string()
                .valid('ACTIVE', 'INACTIVE', 'SUSPEND')
                .default('ACTIVE')
                .allow('', null),
            evenet_activities: Joi.string().allow('', null),
            created_by: Joi.string().allow('', null),
            neighbourhood: Joi.string().allow('', null),
            road: Joi.string().allow('', null),
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

    async eventUpdateValidator(req, res, next) {
        const {
            interests,
            category,
            religion,
            politic,
            music,
            hobbies,
            education,
            language,
            diet,
            carrier,
        } = req.body;
        const schema = Joi.object({
            eventUid: Joi.string().required(),
            title: Joi.string().max(50).required(),
            short_description: Joi.string().allow('', null),
            event_date: Joi.string().allow('', null),
            number_of_people: Joi.number().allow('', null),
            start_time: Joi.string().required(),
            notice_hour: Joi.allow('', null),
            notice_hour_slot: Joi.string().allow('', null),
            user_uid: Joi.string().allow('', null),
            interests: Array.isArray(interests)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            language: Array.isArray(language)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            education: Array.isArray(education)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            hobbies: Array.isArray(hobbies)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            music: Array.isArray(music)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            politic: Array.isArray(politic)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            religion: Array.isArray(religion)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            category: Array.isArray(category)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            address: Joi.string().allow('', null),
            lat: Joi.number().allow('', null),
            long: Joi.number().allow('', null),
            gender: Joi.string()
                .valid('Male', 'Female', 'Non-binary', 'Others', 'All')
                .allow('', null),
            start_age: Joi.number().allow('', null),
            end_age: Joi.number().allow('', null),
            diet: Array.isArray(diet) ? Joi.array().allow('', null) : Joi.string().allow('', null),
            carrier: Array.isArray(carrier)
                ? Joi.array().allow('', null)
                : Joi.string().allow('', null),
            city: Joi.string().allow('', null),
            country: Joi.string().allow('', null),
            relationship_status: Joi.string().allow('', null),
            drink: Joi.string().allow('', null),
            is_athlete: Joi.boolean().default(false),
            smoke: Joi.string().allow('', null),
            face_blur: Joi.boolean().default(false),
            status: Joi.string()
                .valid('ACTIVE', 'INACTIVE', 'SUSPEND')
                .default('ACTIVE')
                .allow('', null),
            evenet_activities: Joi.string().allow('', null),
            created_by: Joi.string().allow('', null),
            neighbourhood: Joi.string().allow('', null),
            road: Joi.string().allow('', null),
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

    async eventUidValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            eventUid: Joi.string().required(),
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

    async eventParticipentValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            status: Joi.string()
                .required()
                .valid('PENDING', 'APPROVED', 'REJECTED', 'SUSPEND')
                .default('PENDING'),
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

    async eventParticipentGroupUpdateValidator(req, res, next) {
        const schema = Joi.object({
            eventParticipentUid: Joi.string().required(),
            type: Joi.string().valid('LEAVE').required(),
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

    async eventGroupUpdateValidator(req, res, next) {
        const schema = Joi.object({
            eventParticipentUid: Joi.string().required(),
            type: Joi.string().valid('BLOCK', 'UNBLOCK').required(),
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
}

module.exports = EventValidator;
