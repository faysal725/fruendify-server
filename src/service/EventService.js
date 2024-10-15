/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongoose').Types;
const cityTimezones = require('city-timezones');
const { DateTime } = require('luxon');
const moment = require('moment-timezone');
const responseHandler = require('../helper/responseHandler');
const logger = require('../config/logger');
const Event = require('../models/Event');
const User = require('../models/User');
const Category = require('../models/Category');
const Favourite = require('../models/Favourite');
const EventParticipent = require('../models/EventParticipent');
const { prepareCommonQueryParams } = require('../helper/requestHandlerHelper');
const { calculateAge, getJoinableStatus,convertTo24Hour, convertTimestamp, getCancelableStatus } = require('../helper/UtilityHelper');
const { formateDateTimeWithTimeZone,formateNewDate} = require('../helper/Timezone');
const NotificationService = require('./NotificationService');

class EventService {
    constructor() {
        this.eventDao = Event;
        this.eventParticipentDao = EventParticipent;
        this.userDao = User;
        this.categoryDao = Category;
        this.FavouriteDao = Favourite;
        this.notificationService = new NotificationService;
    }

    static getRelativePath(filePath, baseDir) {
        const absoluteBaseDir = path.resolve(baseDir);
        const absoluteFilePath = path.resolve(filePath);
        return path.relative(absoluteBaseDir, absoluteFilePath);
    }

    /**
     * Create a event
     * @param {Object} req
     * @returns {Object}
     */
    createEvent = async (req) => {
        try {
            let message = 'Event created Successfully.';
            const {
                title,
                short_description,
                event_date,
                number_of_people,
                start_time,
                notice_hour,
                notice_hour_slot,
                interests,
                address,
                lat,
                long,
                gender,
                start_age,
                end_age,
                diet,
                language,
                education,
                carrier,
                city,
                country,
                hobbies,
                music,
                politic,
                relationship_status,
                drink,
                is_athlete,
                smoke,
                face_blur,
                religion,
                category,
                status,
                evenet_activities,
                created_by,
                neighbourhood,
                road,
            } = req.body;

            const location = {
                type: 'Point',
                coordinates: [long, lat],
            };            

            // Function to move a file
            const moveFile = (fileData) => {
                return new Promise((resolve, reject) => {
                    const uploadDir = path.join('public', 'uploads');

                    // Check if the directory exists
                    if (!fs.existsSync(uploadDir)) {
                        // Create the directory
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const fileName = uniqueSuffix + fileData.name;
                    const uploadPath = path.join(uploadDir, fileName);
                    fileData.mv(uploadPath, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(uploadPath);
                        }
                    });
                });
            };

            let thumbnailImage = null;
            if (req.files?.thumbnail) {
                thumbnailImage = await moveFile(req.files?.thumbnail);
                thumbnailImage = EventService.getRelativePath(thumbnailImage, 'public');
            }
            let event_date_time = null;
            if (event_date && start_time) {
                
                let timeZone = 'UTC';
                const cityLookup = cityTimezones.lookupViaCity(city);
                
                if(cityLookup.length){
                    timeZone = cityLookup[0].timezone;
                }
                const converteTime = convertTo24Hour(start_time)
                const utcTime = moment.tz(`${formateNewDate(event_date)} ${converteTime.toTime.hours}:${converteTime.toTime.minutes}`,timeZone)
        
                event_date_time = utcTime.clone().utc().format();
            }
            
            let noticeHourSlot = 'DAY';

            if (notice_hour_slot) {
                noticeHourSlot = notice_hour_slot;
            }
            
            const data = {
                title,
                short_description,
                event_date,
                event_date_time,
                number_of_people,
                start_time,
                notice_hour,
                notice_hour_slot: noticeHourSlot,
                user_uid: req.user._id,
                interests: Array.isArray(interests) ? interests : interests?.split(','),
                address,
                gender,
                start_age,
                end_age,
                diet: Array.isArray(diet) ? diet : diet?.split(','),
                language: Array.isArray(language) ? language : language?.split(','),
                education: Array.isArray(education) ? education : education?.split(','),
                carrier: Array.isArray(carrier) ? carrier : carrier?.split(','),
                city,
                country,
                hobbies: Array.isArray(hobbies) ? hobbies : hobbies?.split(','),
                music: Array.isArray(music) ? music : music?.split(','),
                politic: Array.isArray(politic) ? politic : politic?.split(','),
                relationship_status,
                drink,
                is_athlete,
                smoke,
                face_blur,
                religion: Array.isArray(religion) ? religion : religion?.split(','),
                category: Array.isArray(category) ? category : category?.split(','),
                status,
                evenet_activities,
                created_by,
                thumbnail: thumbnailImage || null,
                location: location || null,
                neighbourhood,
                road,
            };

            const event = await this.eventDao.create(data);
            const result = await event.save();
            if (!event) {
                message = 'Event create Failed! Please Try again.';
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }
            const joinedEvent = await this.eventParticipentDao.create({
                user_uid: req?.user?._id,
                event_uid: event._id,
                status: 'APPROVED',
                'group_status':'UNBLOCK'
            })
            const notificationData = {
                user_uuid: req?.user?._id,
                event_uid: event._id
            };

            
            await this.notificationService.setNotification(
                `Event ${event?.title} created successfully `,
                req,
                req?.user?._id,
                'GENERAL',
                notificationData,
            );
            
            return responseHandler.returnSuccess(httpStatus.CREATED, message, result);
        } catch (e) {
            logger.error(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    getEventList = async (req) => {
        const { page, perPage, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        
        let searchCriteria = {}; // Initialize search criteria

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
                    from: 'interests', 
                    localField: 'interests',
                    foreignField: '_id',
                    as: 'interests',
                },
            },
            {
                $lookup: {
                    from: 'hobbies', 
                    localField: 'hobbies',
                    foreignField: '_id',
                    as: 'hobbies',
                },
            },
            {
                $lookup: {
                    from: 'politics', 
                    localField: 'politic',
                    foreignField: '_id',
                    as: 'politic',
                },
            },
            {
                $lookup: {
                    from: 'religions', 
                    localField: 'religion',
                    foreignField: '_id',
                    as: 'religion',
                },
            },
            {
                $lookup: {
                    from: 'languages', 
                    localField: 'language',
                    foreignField: '_id',
                    as: 'language',
                },
            },
            {
                $lookup: {
                    from: 'educations', 
                    localField: 'education',
                    foreignField: '_id',
                    as: 'education',
                },
            },
            {
                $lookup: {
                    from: 'categories', 
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
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

        const results = await this.eventDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Event data found', responseData);
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

    getSpecificData = async (req) => {      

        const result = await this.eventDao
            .findById(req.params.eventUid)
            .populate([
                { path: 'language' },
                { path: 'education' },
                { path: 'interests' },
                { path: 'hobbies' },
                { path: 'politic' },
                { path: 'diet' },
                { path: 'music' },
                { path: 'carrier' },
                { path: 'category' },
                { path: 'religion' },
                { 
                    path: 'user_uid',
                    select: 'first_name profile_image'
                }
            ]);

        if (result) {
            const where = {
                user_uid: req.user._id,
                event_uid: result?._id,
            };
            const lastSix = {
                event_uid : result?._id,
                status: "APPROVED",
            }
            const joinedEvent = await this.eventParticipentDao.findOne(where);
            const approvedParticipants = await this.eventParticipentDao.find(lastSix)
            .sort({ _id: -1 }) 
            .limit(6)
            .populate({ path: 'user_uid', select: 'first_name profile_image' }); // Assuming user_uid references user details
        
        const joinableStatus = await getJoinableStatus(req.user,result);
        const cancelableStatus = await getCancelableStatus(req.user,result);
            
        const res = result?.toObject();
        res.joinableStatus = joinableStatus;
        res.cancelableStatus = cancelableStatus;
        res.joinStatus = joinedEvent?.status || null;
        res.participants = approvedParticipants || [];
        return responseHandler.returnSuccess(httpStatus.CREATED, 'Event data found', res);
            
            
            // return responseHandler.returnSuccess(httpStatus.CREATED, 'Event data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Event data not found');
    };

    updateEvent = async (req) => {
        const {
            eventUid,
            title,
            short_description,
            event_date,
            number_of_people,
            start_time,
            notice_hour,
            notice_hour_slot,
            interests,
            address,
            lat,
            long,
            gender,
            start_age,
            end_age,
            diet,
            language,
            education,
            carrier,
            city,
            country,
            hobbies,
            music,
            politic,
            relationship_status,
            drink,
            is_athlete,
            smoke,
            face_blur,
            religion,
            category,
            status,
            evenet_activities,
            created_by,
            neighbourhood,
            road,
        } = req.body;
        const event = await this.eventDao.findById(eventUid);

        // If politic doesn't exist, return error
        if (!event) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Event not found');
        }

        const location = {
            type: 'Point',
            coordinates: [long || event?.long,lat || event?.lat],
        };
        // Function to move a file
        const moveFile = (fileData) => {
            return new Promise((resolve, reject) => {
                const uploadDir = path.join('public', 'uploads');

                // Check if the directory exists
                if (!fs.existsSync(uploadDir)) {
                    // Create the directory
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const fileName = uniqueSuffix + fileData.name;
                const uploadPath = path.join(uploadDir, fileName);
                fileData.mv(uploadPath, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(uploadPath);
                    }
                });
            });
        };

        let thumbnailImage = null;
        if (req.files?.thumbnail) {
            thumbnailImage = await moveFile(req.files?.thumbnail);
            thumbnailImage = EventService.getRelativePath(thumbnailImage, 'public');
        }
        
        let event_date_time = null;
        if (event_date && start_time) {
            event_date_time = new Date(`${event_date} ${start_time}`);
        }
        let noticeHourSlot = event?.notice_hour_slot;

        if (notice_hour_slot) {
            noticeHourSlot = notice_hour_slot;
        }
        const data = {
            title: title || event?.title,
            short_description: short_description || event?.short_description,
            event_date: event_date || event?.event_date,
            event_date_time: event_date_time || event?.event_date_time,
            number_of_people: number_of_people || event?.number_of_people,
            start_time: start_time || event?.start_time,
            notice_hour: notice_hour || event?.notice_hour,
            notice_hour_slot: noticeHourSlot,
            interests: interests
                ? Array.isArray(interests)
                    ? interests
                    : interests?.split(',')
                : event?.interests,
            address: address || event?.address,
            gender: gender || event?.gender,
            start_age: start_age || event?.start_age,
            end_age: end_age || event?.end_age,
            diet: diet ? Array.isArray(diet) ? diet : diet?.split(',') : event?.diet,
            language:language ? Array.isArray(language) ? language : language?.split(',') : event?.language,
            education: education ? Array.isArray(education) ? education : education?.split(',') : event?.education,
            carrier: carrier ? Array.isArray(carrier) ? carrier : carrier?.split(',') : event?.carrier,
            hobbies: hobbies ? Array.isArray(hobbies) ? hobbies : hobbies?.split(',') : event?.hobbies,
            music: music ? Array.isArray(music) ? music : music?.split(','): event?.music,
            politic: politic ? Array.isArray(politic) ? politic : politic?.split(',') : event?.politic,
            relationship_status: relationship_status || event?.relationship_status,
            drink: drink || event?.drink,
            is_athlete: is_athlete || event?.is_athlete,
            smoke: smoke || event?.smoke,
            city: city || event?.city,
            country: country || event?.country,
            face_blur: face_blur || event?.face_blur,
            religion: religion
                ? Array.isArray(religion)
                    ? religion
                    : religion?.split(',')
                : event?.religion,
            category: category
                ? Array.isArray(category)
                    ? category
                    : category?.split(',')
                : event?.category,
            status: status || event?.status,
            evenet_activities: evenet_activities || event?.evenet_activities,
            created_by: created_by || event?.created_by,
            thumbnail: thumbnailImage || event?.thumbnail || '',
            location: location || event?.location,
            neighbourhood,
            road,
        };

        const filter = { _id: eventUid };
        // Save the updated language
        const updatedEvent = await this.eventDao.updateOne(filter, data);

        if (updatedEvent) {
            // Return success response with updated language data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Event updated successfully',
                updatedEvent,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Event update failed');
    };

    deleteEvent = async (req) => {
        const response = await this.eventDao.deleteOne({
            _id: req.params.eventUid,
        });
        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Event deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Event delete failed');
    };

    getEventCategoryList = async (req) => {
        const results = await this.eventDao.findMany();

        return responseHandler.returnSuccess(httpStatus.OK, 'Category data found', results);
    };

    eventJoinRequest = async (req) => {
        const where = {
            user_uid: req.user._id,
            event_uid: req.body.eventUid,
        };
        const results = await this.eventParticipentDao.findOne(where);
        const event = await this.eventDao.findOne({_id: req.body.eventUid});

        if (results?.status === "PENDING") {
            const cancelJoin = await this.eventParticipentDao.deleteOne(where);

            if(cancelJoin) {
                return responseHandler.returnSuccess(httpStatus.OK, 'Request cancel successfully', results);
            }

            return responseHandler.returnSuccess(httpStatus.OK, 'Request cancel failed', results);
        }

        if (results?.status === "SUSPEND" || results?.status==="APPROVED") {
            return responseHandler.returnSuccess(httpStatus.OK, 'Already exist', results);
        }

        const data = {
            user_uid: req.user._id,
            event_uid: req.body.eventUid,
            status: "PENDING"
        };
        if(results?.status==="REJECTED"){
            const filter = { _id: results?._id };
            const eventJoin = await this.eventParticipentDao.updateOne(filter,data)
            if (eventJoin) {
                return responseHandler.returnSuccess(
                    httpStatus.OK,
                    'Successfully join in event',
                    eventJoin,
                );
            }
        }else {
            const eventJoin = await this.eventParticipentDao.create(data);
            if (eventJoin) {
                const notificationData = {
                    participentUid: eventJoin._id,
                    eventUid: req.body.eventUid
                };
              
                await this.notificationService.setNotification(
                    `${req?.user?.first_name} want to join your event ${event?.title}`,
                    req,
                    event?.user_uid,
                    'PARTICIPANT',
                    notificationData,
                );
                return responseHandler.returnSuccess(
                    httpStatus.OK,
                    'Successfully join in event',
                    eventJoin,
                );
            }
        }
        

        return responseHandler.returnError(
            httpStatus.BAD_REQUEST,
            'Failed to join in event.',
            null,
        );
    };

    getEventParticipentData = async (req) => {
        const event = await this.eventDao.findOne({
            user_uid: req.user._id,
            _id: req.params.eventUid
        });
        if (!event) {
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Event not found');

        }
        const result = await this.eventParticipentDao
            .find({
                $and: [
                    { event_uid: req.params.eventUid },
                    { status:"APPROVED" },
                    { user_uid: { $ne: req?.user?._id } }
                ]
            })
            .populate([{
                path: 'user_uid',
                select: 'first_name email profile_image location' // Include specific fields from the user_uid document
            }]);

        if (result) {
            const modifiedResult = await Promise.all(
                result.map(async (data) => {

                    const eventDistance = this.calculateDistance(
                        req?.user?.location?.coordinates,
                        data.user_uid.location.coordinates,
                    );
                    const favouriteCount = await this.FavouriteDao.countDocuments({ from_user: data.user_uid._id });
                    let isFavourite = await this.FavouriteDao.findOne({ from_user: req.user._id, to_user: data.user_uid._id });
                    if(isFavourite) {
                        isFavourite = true;
                    } else {
                        isFavourite = false;
                    }
                    // Combine the result and userImages into one object
                    const combinedResult = {
                        ...data.toObject(), 
                        eventDistance,
                        favouriteCount,
                        isFavourite
                    };

                    return combinedResult;
                }),
            );

            return responseHandler.returnSuccess(httpStatus.CREATED, 'Event data found', modifiedResult);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Event data not found');
    };
    
    getEventParticipentRequest = async (req) => {
        const event = await this.eventDao.findOne({
            user_uid: req.user._id,
            _id: req.params.eventUid
        });
        if (!event) {
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Event not found');
        }
        const result = await this.eventParticipentDao
        .find({
            $and: [
                { event_uid: req.params.eventUid },
                { status:"PENDING" }
            ]
        })
            .populate([{
                path: 'user_uid',
                select: 'first_name email profile_image location' // Include specific fields from the user_uid document
            }]);

        if (result) {
            const modifiedResult = await Promise.all(
                result.map(async (data) => {

                    const eventDistance = this.calculateDistance(
                        req?.user?.location?.coordinates,
                        data.user_uid.location.coordinates,
                    );
                    const favouriteCount = await this.FavouriteDao.countDocuments({ from_user: data.user_uid._id });

                    // Combine the result and userImages into one object
                    const combinedResult = {
                        ...data.toObject(), 
                        eventDistance,
                        favouriteCount
                    };

                    return combinedResult;
                }),
            );

            return responseHandler.returnSuccess(httpStatus.CREATED, 'Participant data found', modifiedResult);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Participant data not found');
    };

    eventParticipentStatusUpdate = async (req) => {
        const data = {
            status: req.body.status,
        };

        const filter = { _id: req.params.participantId };
        // Save the updated language
        const updatedEvent = await this.eventParticipentDao.updateOne(filter, data);

        if (updatedEvent) {
            const eventParticipent = await this.eventParticipentDao.findOne(filter);

            const notificationData = {
                participentUid: req.params.participantId,
                eventUid: eventParticipent?.event_uid
            };
            
            await this.notificationService.setNotification(
                `Your participant request has been ${req.body.status}`,
                req,
                eventParticipent?.user_uid,
                'PARTICIPANT',
                notificationData,
            );
            // Return success response with updated language data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Event updated successfully',
                updatedEvent,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Event update failed');
    };

    eventParticipentDelete = async (req) => {
        const filter = { _id: req.params.participantId };
        // Save the updated language
        const updatedEvent = await this.eventParticipentDao.deleteOne(filter);

        if (updatedEvent) {
            // Return success response with updated language data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Participant deleted successfully',
                updatedEvent,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Participant delete failed');
    };

    getMyEvent = async (req) => {
        const { page, perPage, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria

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
                $match : { user_uid : req?.user?._id },

            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_uid',
                    foreignField: '_id',
                    as: 'user',
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: 'languages',
                    localField: 'user.language', // Assuming language field in user object
                    foreignField: '_id',
                    as: 'language',
                }
            },
            {
                $project: {
                    city: 1,
                    country: 1,
                    category: 1,
                    _id: 1,
                    user_uid: 1,
                    notice_hour: 1,
                    title: 1,
                    event_date: 1,
                    thumbnail: 1,
                    start_time: 1,
                    language: 1,
                    location:1,
                    'user.first_name': 1,
                    'user.profile_image': 1,
                    'user.last_name': 1,
                    'user._id': 1,
                }
            },
            { 
                $sort: {createdAt:1}
            }
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

        const results = await this.eventDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Event data found', responseData);
    };
    

    getJoinedEvent = async (req) => {
        const { page, perPage, orderBy } = prepareCommonQueryParams(req?.query);
            let searchCriteria = {};
            searchCriteria.user_uid = req.user._id
            searchCriteria.status= "APPROVED"
            const pipeline = [
                {
                    $match: searchCriteria
                },
                {
                    $lookup: {
                        from: 'categories', 
                        localField: 'event.category',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                {
                    $lookup: {
                        from: 'events',
                        localField: 'event_uid',
                        foreignField: '_id',
                        as: 'event',
                    }
                },
                {
                    $unwind: {
                        path: '$event',
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    // Add a $match stage here to filter out events where user_uid is "478559449"
                    $match: {
                        'event.user_uid': { $ne: req.user._id }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_uid',
                        foreignField: '_id',
                        as: 'user',
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $lookup: {
                        from: 'languages',
                        localField: 'event.language',
                        foreignField: '_id',
                        as: 'language',
                    }
                },
                {
                    $project: {
                        'event.category': 1,
                        'event.city': 1,
                        'event.country': 1,
                        'event._id': 1,
                        'event.user_uid': 1,
                        'event.notice_hour': 1,
                        'event.title': 1,
                        'event.event_date': 1,
                        'event.thumbnail': 1,
                        'event.start_time': 1,
                        language: 1,
                        'event.location': 1,
                        'event.distance': 1,
                        'event.gender':1,
                        'event.start_age':1,
                        'event.end_age':1,
                        'user.first_name': 1,
                        'user.profile_image': 1,
                        'user.last_name': 1,
                        'user._id': 1,
                    }
                },
                { 
                    $sort: orderBy 
                }
            ];
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
        
            const results = await this.eventParticipentDao.aggregate(pipeline);
            const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);
            
            // Prepare metadata object
            const metadata = {
                totalDocuments,
                totalPages,
                currentPage: page,
                perPage,
            };
            const modifiedResult = await Promise.all(
                results[0].data.map(async (data) => {
                    const lastSix = {
                        event_uid : data.event?._id,
                        status: "APPROVED",
                    }
                    const approvedParticipants = await this.eventParticipentDao.find(lastSix)
                        .sort({ _id: -1 }) 
                        .limit(6)
                        .populate({ path: 'user_uid', select: 'first_name profile_image' });
                        const categories = await this.categoryDao.find({
                        _id: { $in: data.event.category } 
                        });

                    
                    const eventDistance = this.calculateDistance(
                        req?.user?.location?.coordinates,
                        data.event.location.coordinates,
                    );
                    data.participants = approvedParticipants;
                    // Combine the result and userImages into one object
                    const combinedResult = {
                        ...data,
                        eventDistance,
                        categories
                    };
                    return combinedResult;
                }),
            );
            // Return results along with metadata
            const responseData = {
                data: modifiedResult,
                metadata,
            };
            return responseHandler.returnSuccess(httpStatus.OK, 'Event data found', responseData);
    };

    getEventGroup = async (req) => {
        const { page, perPage, orderBy } = prepareCommonQueryParams(req?.query);
            let searchCriteria = {};
            searchCriteria.user_uid = req.user._id
            searchCriteria.status= "APPROVED"
            searchCriteria.group_status= "UNBLOCK"
            const pipeline = [
                {
                    $match: searchCriteria
                },
                {
                    $lookup: {
                        from: 'categories', 
                        localField: 'event.category',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                {
                    $lookup: {
                        from: 'events',
                        localField: 'event_uid',
                        foreignField: '_id',
                        as: 'event',
                    }
                },
                {
                    $unwind: {
                        path: '$event',
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_uid',
                        foreignField: '_id',
                        as: 'user',
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $lookup: {
                        from: 'languages',
                        localField: 'event.language',
                        foreignField: '_id',
                        as: 'language',
                    }
                },
                {
                    $project: {
                        'event.category': 1,
                        'event.city': 1,
                        'event.country': 1,
                        'event._id': 1,
                        'event.user_uid': 1,
                        'event.notice_hour': 1,
                        'event.title': 1,
                        'event.event_date': 1,
                        'event.thumbnail': 1,
                        'event.start_time': 1,
                        language: 1,
                        'event.location': 1,
                        'event.distance': 1,
                        'event.gender':1,
                        'event.start_age':1,
                        'event.end_age':1,
                        'user.first_name': 1,
                        'user.profile_image': 1,
                        'user.last_name': 1,
                        'user._id': 1,
                    }
                },
                { 
                    $sort: orderBy 
                }
            ];
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
        
            const results = await this.eventParticipentDao.aggregate(pipeline);
            const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);
            
            // Prepare metadata object
            const metadata = {
                totalDocuments,
                totalPages,
                currentPage: page,
                perPage,
            };
            const modifiedResult = await Promise.all(
                results[0].data.map(async (data) => {
                    const lastSix = {
                        event_uid : data.event?._id,
                        status: "APPROVED",
                    }
                    const approvedParticipants = await this.eventParticipentDao.find(lastSix)
                        .sort({ _id: -1 }) 
                        .limit(6)
                        .populate({ path: 'user_uid', select: 'first_name profile_image' });
                        const categories = await this.categoryDao.find({
                        _id: { $in: data.event.category } 
                        });

                    
                    const eventDistance = this.calculateDistance(
                        req?.user?.location?.coordinates,
                        data.event.location.coordinates,
                    );
                    data.participants = approvedParticipants;
                    // Combine the result and userImages into one object
                    const combinedResult = {
                        ...data,
                        eventDistance,
                        categories
                    };
                    return combinedResult;
                }),
            );
            // Return results along with metadata
            const responseData = {
                data: modifiedResult,
                metadata,
            };
            return responseHandler.returnSuccess(httpStatus.OK, 'Event data found', responseData);
    };


    getUpComingEvent = async (req) => {
        const { page, perPage, orderBy } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {};
        searchCriteria.user_uid = req.user._id;
        searchCriteria.status = "APPROVED";
        searchCriteria.user_uid = { $ne: req?.user?._id };

        const pipeline = [
            {
                $match: searchCriteria
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'event_uid',
                    foreignField: '_id',
                    as: 'event',
                }
            },
            {
                $unwind: {
                    path: '$event',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    'event.event_date_converted': {
                        $dateFromString: {
                            dateString: '$event.event_date'
                        }
                    }
                }
            },
            {
                // Filter for upcoming events
                $match: {
                    'event.event_date_time': { $gt: new Date() }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_uid',
                    foreignField: '_id',
                    as: 'user',
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: 'languages',
                    localField: 'event.language',
                    foreignField: '_id',
                    as: 'language',
                }
            },
            {
                $project: {
                    'event.city': 1,
                    'event.country': 1,
                    'event._id': 1,
                    'event.user_uid': 1,
                    'event.notice_hour': 1,
                    'event.description': 1,
                    'event.title': 1,
                    'event.event_date': 1,
                    'event.thumbnail': 1,
                    'event.start_time': 1,
                    language: 1,
                    'event.location': 1,
                    'event.distance': 1,
                    'event.gender': 1,
                    'event.start_age': 1,
                    'event.end_age': 1,
                    'user.first_name': 1,
                    'user.profile_image': 1,
                    'user.last_name': 1,
                    'user._id': 1,
                }
            },
            { 
                $sort: orderBy 
            },
            {
                $facet: {
                    data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
                    metaData: [
                        { $count: 'totalDocuments' },
                        { $addFields: { page, perPage } },
                    ],
                },
            },
        ];
        
        const results = await this.eventParticipentDao.aggregate(pipeline);
        const { totalDocuments } = results[0].metaData[0] || { totalDocuments: 0 };
        const totalPages = Math.ceil(totalDocuments / perPage);
    
        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };

        const modifiedResult = await Promise.all(
            results[0].data.map(async (data) => {
                const categories = await this.categoryDao.find({
                    _id: { $in: data.event.category } 
                 });
                const eventDistance = this.calculateDistance(
                    req?.user?.location?.coordinates,
                    data.event.location.coordinates,
                );
                // Combine the result and userImages into one object
                const combinedResult = {
                    ...data,
                    eventDistance,
                    categories
                };
                return combinedResult;
            }),
        );
        // Return results along with metadata
        const responseData = {
            data: modifiedResult,
            metadata,
        };
        
        return responseHandler.returnSuccess(httpStatus.OK, 'Event data found', responseData);
    };

    getDiscoverEvent = async (req) => {
        const { 
            page, perPage, orderBy, language, lat, long, diet, distance,
             drinking,
             categories,
             searc,
             interests,
             event_date
         } = prepareCommonQueryParams(req?.body);
        
         
        const user = await this.userDao.findOne({_id: req.user._id});
        let userAge = null;
        
        if (user.birth_date) {
            userAge = calculateAge(user.birth_date);
        }
        const userWantToMeet = [];
        userWantToMeet.push('All');

        if (user.gender) {
            userWantToMeet.push(user.gender);
        }

        let userLocation = req?.user?.location?.coordinates;
        
        if (lat && long) {
            userLocation = [long, lat];
        }
        let searchCriteria = {}; // Initialize search criteria
        const currentTime = new Date();
        
        // searchCriteria.event_date_time = {$gte: currentTime};
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searc) {
            searchCriteria.title = { $regex: searc, $options: 'i' };
        }

        if (userWantToMeet) {
            searchCriteria.gender = {$in: userWantToMeet};
        }

        if (userAge) {
            searchCriteria.start_age = {$lte: userAge};
            searchCriteria.end_age = {$gte: userAge};
        }

        if (language) {
            const objectIdArray = language.map(id => {return new ObjectId(id)});
            searchCriteria.language = { $in: objectIdArray };
        }

        if (userLocation) {
            let userDistance = 30000;
            if(distance) {
                userDistance = distance;
            }
            searchCriteria.location = {
                $geoWithin: {
                    $centerSphere: [userLocation, userDistance / 6378.1] // 50 meters radius
                }
            };
        }

        if (diet) {
            const objectIdArray = diet.map(id => {return new ObjectId(id)});
            searchCriteria.diet = { $in: objectIdArray };
        }

        if (drinking) {
            searchCriteria.drink = { $in: drinking };
        }

        if (interests && Array.isArray(interests)) {
            const interestArray = Array.isArray(interests) ? interests : interests?.split(',');

            const objectIdArray = interestArray.map(id => {return new ObjectId(id)});
            if (objectIdArray.length) {
                searchCriteria.interests = { $in: objectIdArray };
            }
        }

        if (categories) {
            const categoriesArray = Array.isArray(categories) ? categories : categories?.split(',');

            const objectIdArray = categoriesArray.map(id => {return new ObjectId(id)});
            if (objectIdArray.length) {
                searchCriteria.category = { $in: objectIdArray };
            }
        }

        if ( typeof event_date !== 'undefined') {
            if (Array.isArray(event_date) && event_date.length) {
                const startDate = event_date[0];
                const endDate = event_date[1];

                searchCriteria.event_date = {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        }

        console.log(searchCriteria, 'searchCriteria');
        const pipeline = [
            ...(Object.keys(searchCriteria).length ? [{ $match: searchCriteria }] : []),
            {
                $lookup: {
                    from: 'interests', 
                    localField: 'interests',
                    foreignField: '_id',
                    as: 'interests',
                },
            },
            {
                $lookup: {
                    from: 'hobbies', 
                    localField: 'hobbies',
                    foreignField: '_id',
                    as: 'hobbies',
                },
            },
            {
                $lookup: {
                    from: 'politics', 
                    localField: 'politic',
                    foreignField: '_id',
                    as: 'politic',
                },
            },
            {
                $lookup: {
                    from: 'religions', 
                    localField: 'religion',
                    foreignField: '_id',
                    as: 'religion',
                },
            },
            {
                $lookup: {
                    from: 'languages', 
                    localField: 'language',
                    foreignField: '_id',
                    as: 'language',
                },
            },
            {
                $lookup: {
                    from: 'educations', 
                    localField: 'education',
                    foreignField: '_id',
                    as: 'education',
                },
            },
            {
                $lookup: {
                    from: 'categories', 
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userUid: '$user_uid' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$userUid']
                                }
                            }
                        },
                        {
                            $project: {
                                // Include only the fields you want
                                email: 1,
                                first_name: 1,
                                last_name: 1,
                                profile_image: 1,
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    city: 1,
                    country: 1,
                    category: 1,
                    _id: 1,
                    user_uid: 1,
                    notice_hour: 1,
                    notice_hour_slot: 1,
                    title: 1,
                    event_date: 1,
                    event_date_time: 1,
                    thumbnail: 1,
                    start_time: 1,
                    language: 1,
                    location:1,
                    'user.first_name': 1,
                    'user.profile_image': 1,
                    'user.last_name': 1,
                    'user._id': 1,
                    'number_of_people': 1,
                    'face_blur': 1,
                    'neighbourhood': 1,
                }
            },
            { $sort: orderBy },
        ];

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

        const results = await this.eventDao.aggregate(pipeline);
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };
        const modifiedResult = await Promise.all(
            results[0].data.map(async (data) => {

                const joinableStatus = await getJoinableStatus(req.user,data);
                const cancelableStatus = await getCancelableStatus(req.user,data);
                
                const eventDistance = this.calculateDistance(
                    userLocation,
                    data.location.coordinates,
                );
                // Combine the result and userImages into one object
                const combinedResult = {
                    ...data,
                    eventDistance,
                    joinableStatus,
                    cancelableStatus,
                };
                return combinedResult;
            }),
        );
        // Return results along with metadata
        const responseData = {
            data: modifiedResult,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Event data found', responseData);
    };

    getSingleDiscoverEvent = async (req) => {
        const { 
            page, orderBy,
             searchKey, language, lat, long, diet, distance,
             drinking,
             categories,
             event_date
         } = prepareCommonQueryParams(req?.body);
         const perPage = 1;
        
        const user = await this.userDao.findOne({_id: req.user._id});
        let userAge = null;
        
        if (user.birth_date) {
            userAge = calculateAge(user.birth_date);
        }
        const userWantToMeet = [];
        userWantToMeet.push('All');

        if (user.gender) {
            userWantToMeet.push(user.gender);
        }

        let userLocation = req?.user?.location?.coordinates;
        
        if (lat && long) {
            userLocation = [long, lat];
        }
        let searchCriteria = {}; // Initialize search criteria
        const currentTime = new Date();
        
        // searchCriteria.event_date_time = {$gte: currentTime};
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                title: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        if (userWantToMeet) {
            searchCriteria.gender = {$in: userWantToMeet};
        }

        if (userAge) {
            searchCriteria.start_age = {$lte: userAge};
            searchCriteria.end_age = {$gte: userAge};
        }

        if (language) {
            const objectIdArray = language.map(id => {return new ObjectId(id)});
            searchCriteria.language = { $in: objectIdArray };
        }

        if (userLocation) {
            let userDistance = 30000;
            if(distance) {
                userDistance = distance;
            }
            searchCriteria.location = {
                $geoWithin: {
                    $centerSphere: [userLocation, userDistance / 6378.1] // 50 meters radius
                }
            };
        }

        if (diet) {
            const objectIdArray = diet.map(id => {return new ObjectId(id)});
            searchCriteria.diet = { $in: objectIdArray };
        }

        if (drinking) {
            searchCriteria.drink = { $regex: drinking, $options: 'i' }; 
        }
        if (categories) {
            const categoriesArray = Array.isArray(categories) ? categories : categories?.split(',');

            const objectIdArray = categoriesArray.map(id => {return new ObjectId(id)});
            if (objectIdArray.length) {
                searchCriteria.category = { $in: objectIdArray };
            }
        }

        const pipeline = [
            ...(Object.keys(searchCriteria).length ? [{ $match: searchCriteria }] : []),
            {
                $lookup: {
                    from: 'interests', 
                    localField: 'interests',
                    foreignField: '_id',
                    as: 'interest',
                },
            },
            {
                $lookup: {
                    from: 'hobbies', 
                    localField: 'hobbies',
                    foreignField: '_id',
                    as: 'hobbies',
                },
            },
            {
                $lookup: {
                    from: 'politic', 
                    localField: 'politic',
                    foreignField: '_id',
                    as: 'politic',
                },
            },
            {
                $lookup: {
                    from: 'religions', 
                    localField: 'religion',
                    foreignField: '_id',
                    as: 'religion',
                },
            },
            {
                $lookup: {
                    from: 'languages', 
                    localField: 'language',
                    foreignField: '_id',
                    as: 'language',
                },
            },
            {
                $lookup: {
                    from: 'educations', 
                    localField: 'education',
                    foreignField: '_id',
                    as: 'education',
                },
            },
            {
                $lookup: {
                    from: 'categories', 
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'diets', 
                    localField: 'diet',
                    foreignField: '_id',
                    as: 'diet',
                },
            },
            {
                $lookup: {
                    from: 'educations', 
                    localField: 'education',
                    foreignField: '_id',
                    as: 'education',
                },
            },
            {
                $lookup: {
                    from: 'carrier', 
                    localField: 'carrier',
                    foreignField: '_id',
                    as: 'carrier',
                },
            },
            {
                $lookup: {
                    from: 'hobbies', 
                    localField: 'hobbies',
                    foreignField: '_id',
                    as: 'hobbies',
                },
            },
            {
                $lookup: {
                    from: 'musics', 
                    localField: 'music',
                    foreignField: '_id',
                    as: 'music',
                },
            },
            {
                $lookup: {
                    from: 'politicsss', 
                    localField: 'politic',
                    foreignField: '_id',
                    as: 'politic',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userUid: '$user_uid' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$userUid']
                                }
                            }
                        },
                        {
                            $project: {
                                // Include only the fields you want
                                email: 1,
                                first_name: 1,
                                last_name: 1,
                                profile_image: 1,
                            }
                        }
                    ],
                    as: 'user_uid'
                }
            },
            {
                $unwind: {
                    path: '$user_uid',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    city: 1,
                    country: 1,
                    category: 1,
                    _id: 1,
                    user_uid: 1,
                    notice_hour: 1,
                    notice_hour_slot: 1,
                    title: 1,
                    event_date: 1,
                    event_date_time: 1,
                    thumbnail: 1,
                    start_time: 1,
                    language: 1,
                    location:1,
                    'user.first_name': 1,
                    'user.profile_image': 1,
                    'user.last_name': 1,
                    'user._id': 1,
                    'number_of_people': 1,
                    'short_description': 1,
                    'address': 1,
                    'gender': 1,
                    'start_age': 1,
                    'end_age': 1,
                    'relationship_status': 1,
                    'drink': 1,
                    'is_athlete': 1,
                    'smoke': 1,
                    'face_blur': 1,
                    'religion': 1,
                    'status': 1,
                    'createdAt': 1,
                    'updatedAt': 1,
                }
            },
            { $sort: orderBy },
        ];

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

        const results = await this.eventDao.aggregate(pipeline);
        const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

        // Prepare metadata object
        const metadata = {
            totalDocuments,
            totalPages,
            currentPage: page,
            perPage,
        };
        const modifiedResult = await Promise.all(
            results[0].data.map(async (result) => {

                // const joinableStatus = await getJoinableStatus(req.user,data);
                // const cancelableStatus = await getCancelableStatus(req.user,data);
                
                // const eventDistance = this.calculateDistance(
                //     userLocation,
                //     data.location.coordinates,
                // );
                // // Combine the result and userImages into one object
                // const combinedResult = {
                //     ...data,
                //     eventDistance,
                //     joinableStatus,
                //     cancelableStatus,
                // };
                // return combinedResult;

                const where = {
                    user_uid: req.user._id,
                    event_uid: result?._id,
                };
                const lastSix = {
                    event_uid : result?._id,
                    status: "APPROVED",
                }
                const joinedEvent = await this.eventParticipentDao.findOne(where);
                const approvedParticipants = await this.eventParticipentDao.find(lastSix)
                .sort({ _id: -1 }) 
                .limit(6)
                .populate({ path: 'user_uid', select: 'first_name profile_image' }); // Assuming user_uid references user details
                const joinableStatus = await getJoinableStatus(req.user,result);
                const cancelableStatus = await getCancelableStatus(req.user,result);
                // const res = result?.toObject();

                // Combine the result and userImages into one object
                const combinedResult = {
                    ...result,
                    joinableStatus,
                    cancelableStatus,
                    joinStatus: joinedEvent?.status || null,
                    participants: approvedParticipants || [],
                };
                return combinedResult;
            }),
        );
        // Return results along with metadata
        const responseData = {
            data: modifiedResult,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Event data found', responseData);
    };

    calculateDistance = (coord1, coord2) => {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;

        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    };

    toRadians = (degrees) => {
        return degrees * (Math.PI / 180);
    };

    eventParticipentGroupStatusUpdate = async (req) => {
        const {
            eventParticipentUid,
        } = req.body;
        // const event = await this.eventDao.findById(eventUid);
        const eventParticipent = await this.eventParticipentDao.findOne({_id:eventParticipentUid,user_uid:req.user._id,group_status:{$ne : "LEAVE"}});
        
        // If participent doesn't exist, return error
        if (!eventParticipent) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Event not found');
        }
        const data = {
            group_status: "LEAVE"
        };

        const filter = { _id: eventParticipentUid };
        // Save the updated language
        const updatedEventParticipent = await this.eventParticipentDao.updateOne(filter, data);

        if (updatedEventParticipent) {
            // Return success response with updated language data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Event participent updated successfully',
                updatedEventParticipent,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Group participent update failed');
    };


    eventGroupStatusUpdate = async (req) => {
        const {
            eventParticipentUid,
            type
        } = req.body;
        // const event = await this.eventDao.findById(eventUid);
        const eventParticipent = await this.eventParticipentDao.findOne({_id:eventParticipentUid,group_status:{$ne : "LEAVE"}}).populate('event_uid');

        // If politic doesn't exist, return error
        if (!eventParticipent) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Group not found');
        }

        if(!eventParticipent.event_uid.user_uid===req.user._id){
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Group not found');
        }

        const data = {
            group_status: type
        };

        const filter = { _id: eventParticipentUid };
        // Save the updated language
        const updatedEventParticipent = await this.eventParticipentDao.updateOne(filter, data);

        if (updatedEventParticipent) {
            // Return success response with updated language data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Event participent updated successfully',
                updatedEventParticipent,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Event participent update failed');
    };

    eventCancelRequest = async (req) => {
        const where = {
            user_uid: req.user._id,
            event_uid: req.body.eventUid,
        };
        const results = await this.eventParticipentDao.findOne(where);
        const event = await this.eventDao.findOne({_id: req.body.eventUid});

        if (results?.status !== "PENDING") {
            return responseHandler.returnSuccess(httpStatus.OK, 'Already approved', results);
        }

        const data = {
            user_uid: req.user._id,
            event_uid: req.body.eventUid,
            status: "PENDING"
        };
        const eventJoin = await this.eventParticipentDao.deleteOne(data);
        if (eventJoin) {
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Successfully cancel request in event',
                eventJoin,
            );
        }
        

        return responseHandler.returnError(
            httpStatus.BAD_REQUEST,
            'Failed to cancel in event.',
            null,
        );
    };

}

module.exports = EventService;