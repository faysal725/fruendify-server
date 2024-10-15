/* eslint-disable class-methods-use-this */
const Joi = require('joi');
const httpStatus = require('http-status');
const ApiError = require('../helper/ApiError');
const responseHandler = require('../helper/responseHandler');

class UserValidator {
    async userCreateValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            confirm_password: Joi.string().valid(Joi.ref('password')).required(),
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

    async registeredUserValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
            registered_token: Joi.required(),
            full_name: Joi.string().required(),
            birth_date: Joi.date().required(),
            aboutFrundify: Joi.string().allow('', null),
            gender: Joi.string().required(),
            jobTitle: Joi.string().allow('', null),
            industry: Joi.string().allow('', null),
            experience: Joi.number().allow('', null),
            jobDescription: Joi.string().allow('', null),
            interests: Joi.allow('', null),
            joining_reason: Joi.string().allow('', null),
            description: Joi.string().allow('', null),
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

    async userLoginValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
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

    async checkEmailValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
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

    async otpEmailValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
            otp: Joi.number().required(),
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

    async changePasswordValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            old_password: Joi.string().required(),
            password: Joi.string().min(6).required(),
            confirm_password: Joi.string().min(6).required(),
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

    async userIdValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            id: Joi.string().required(),
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

    async emailValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
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

    async userUpdateValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            full_name: Joi.string().allow('', null),
            birth_date: Joi.date().allow('', null),
            gender: Joi.string().allow('', null),
            religion: Joi.string().allow('', null),
            education: Joi.string().allow('', null),
            maritial_status: Joi.string().allow('', null),
            smoke: Joi.boolean().allow('', null),
            drinks: Joi.boolean().allow('', null),
            diet: Joi.string().allow('', null),
            sport: Joi.boolean().allow('', null),
            height: Joi.number().allow('', null),
            languages: Joi.array().allow('', null),
            want_to_meet: Joi.array().allow('', null),
            description: Joi.string().allow('', null),
            interests: Joi.array().allow('', null),
            joining_reason: Joi.string().allow('', null),
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

    async userResetPasswordValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            old_password: Joi.string().required(),
            // password: Joi.string().required(),
            // confirm_password: Joi.string().required(),
            password: Joi.string().min(6).required().label('Password'),
            confirm_password: Joi.string()
                .required()
                .valid(Joi.ref('password'))
                .label('Confirm password')
                .messages({
                    'any.only': '{{#label}} does not match password',
                }),
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

    async forgetPasswordValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            email: Joi.string().email().required(),
            otp: Joi.string().required(),
            password: Joi.string().min(6).required().label('Password'),
            confirm_password: Joi.string()
                .required()
                .valid(Joi.ref('password'))
                .label('Confirm password')
                .messages({
                    'any.only': '{{#label}} does not match password',
                }),
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

    async userUidValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            id: Joi.string().required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.query, options);

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

    async userImageValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            verify_image: Joi.required(),
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

    async toUserIdValidation(req, res, next) {
        // create schema object
        const schema = Joi.object({
            toUserId: Joi.string().required(),
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

    async requestIdValidation(req, res, next) {
        // create schema object
        const schema = Joi.object({
            requestId: Joi.string().required(),
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

    async userLocationUpdateValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            longitude: Joi.number().required(),
            latitude: Joi.number().required(),
            road: Joi.string().allow('', null),
            city: Joi.string().allow('', null),
            country: Joi.string().allow('', null),
            timezone: Joi.string().allow('', null),
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

    async deleteUserImageValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            imageUid: Joi.string().required(),
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

    async userQueryIdValidator(req, res, next) {
        // create schema object
        const schema = Joi.object({
            userId: Joi.string().required(),
        });

        // schema options
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
        };

        // validate request body against schema
        const { error, value } = schema.validate(req.query, options);

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

    async makeFavouriteValidation(req, res, next) {
        // create schema object
        const schema = Joi.object({
            toUserId: Joi.string().required(),
            isFavourite: Joi.boolean().required(),
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

module.exports = UserValidator;
