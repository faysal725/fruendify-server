/* eslint-disable class-methods-use-this */
const httpStatus = require('http-status');
const { Json } = require('sequelize/lib/utils');
const Notification = require('../models/Notification');
const { prepareCommonQueryParams } = require('../helper/requestHandlerHelper');
const responseHandler = require('../helper/responseHandler');
const logger = require('../config/logger');

class NotificationService {
    constructor() {
        this.notificationDao = Notification;
    }

    getNotificationList = async (req) => {
        const { page, perPage, orderBy, searchKey } = prepareCommonQueryParams(req?.query);

        // eslint-disable-next-line no-underscore-dangle
        let searchCriteria = { user_uuid: req?.user?._id }; // Initialize search criteria

        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    let: { userUid: '$send_from' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$userUid'],
                                },
                            },
                        },
                        {
                            $project: {
                                // Include only the fields you want
                                email: 1,
                                first_name: 1,
                                last_name: 1,
                                profile_image: 1,
                            },
                        },
                    ],
                    as: 'user',
                },
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $sort: orderBy },
        ];

        // Conditionally add $match stage if searchCriteria is not empty
        if (Object.keys(searchCriteria).length !== 0) {
            pipeline.push({
                $match: searchCriteria,
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                metaData: [
                    {
                        $count: 'totalDocuments',
                    },
                    {
                        $addFields: {
                            page,
                            perPage,
                        },
                    },
                ],
            },
        });

        const results = await this.notificationDao.aggregate(pipeline);
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        // Return results along with metadata
        const responseData = {
            data: results[0].data,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Notifiction data found', responseData);
    };

    getUnreadNotificationList = async (req) => {
        const { page, perPage, orderBy, searchKey } = prepareCommonQueryParams(req?.query);

        // eslint-disable-next-line no-underscore-dangle
        let searchCriteria = { user_uuid: req?.user?._id, is_seen: false }; // Initialize search criteria

        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    let: { userUid: '$send_from' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$userUid'],
                                },
                            },
                        },
                        {
                            $project: {
                                // Include only the fields you want
                                email: 1,
                                first_name: 1,
                                last_name: 1,
                                profile_image: 1,
                            },
                        },
                    ],
                    as: 'user',
                },
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $sort: orderBy },
        ];

        // Conditionally add $match stage if searchCriteria is not empty
        if (Object.keys(searchCriteria).length !== 0) {
            pipeline.push({
                $match: searchCriteria,
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                metaData: [
                    {
                        $count: 'totalDocuments',
                    },
                    {
                        $addFields: {
                            page,
                            perPage,
                        },
                    },
                ],
            },
        });

        const results = await this.notificationDao.aggregate(pipeline);
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        // Return results along with metadata
        const responseData = {
            data: results[0].data,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Notifiction data found', responseData);
    };

    // eslint-disable-next-line class-methods-use-this
    calculatePaginationMetadata = (results, perPage) => {
        let totalDocuments = 0; // Initialize totalDocuments with 0

        if (results[0].metaData && results[0].metaData.length > 0) {
            totalDocuments = results[0].metaData[0].totalDocuments; // Update totalDocuments if metaData is defined
        }

        const totalPages = Math.ceil(totalDocuments / perPage);

        return {
            totalDocuments,
            totalPages,
        };
    };

    updateNotificationStatus = async (req) => {
        try {
            let message = 'Successfully updated notification status';
            const { notificationUid } = req.params;

            const where = { _id: notificationUid };

            const updateData = {
                is_seen: true,
            };

            const notification = await this.notificationDao.updateOne(where, updateData);

            if (!notification) {
                message = 'Update Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }
            return responseHandler.returnSuccess(httpStatus.CREATED, message, null);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    setNotification = async (
        message,
        request,
        userUid = null,
        type = 'GENERAL',
        data = null,
        sendFrom = null,
        sendTo = null,
    ) => {
        try {
            console.log(userUid, 'userUid');
            const notificationData = {
                user_uuid: userUid || '',
                text: message || '',
                type: type || '',
                data: JSON.stringify(data) || '',
                send_to: sendTo || 'INDIVIDUAL',
                // eslint-disable-next-line no-underscore-dangle
                send_from: sendFrom || request?.user?._id,
            };

            const notification = await this.notificationDao.create(notificationData);

            if (!notification) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    'Create Failed! Please Try again.',
                );
            }

            globalThis.io.emit(userUid, {               
                ...notification._doc,
                user: {
                    _id: request.user._id,
                    email: request.user.email,
                    first_name: request.user.first_name,
                    profile_image: request.user.profile_image,
                },
            });

            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Successfully created notification',
                null,
            );
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };
}

module.exports = NotificationService;
