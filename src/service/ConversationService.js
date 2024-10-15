/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
const httpStatus = require("http-status");
const responseHandler = require("../helper/responseHandler");
const logger = require("../config/logger");
const Conversation = require("../models/Conversation");
const EventParticipent = require("../models/EventParticipent");
const { prepareCommonQueryParams } = require("../helper/requestHandlerHelper");

class ConversationService {
  constructor() {
    this.conversationDao = Conversation;
    this.eventParticipentDao = EventParticipent;
  }

  /**
   * Create a event
   * @param {Object} req
   * @returns {Object}
   */
  createConversation = async (req) => {
    try {
      let message = "Conversation created Successfully.";
      const { eventUid } = req.body;

      const data = {
        eventUid,
        message: req?.body?.message,
        userUid: req.user._id,
      };
      const event = await this.conversationDao.create(data);
      const result = await event.save();

      globalThis.io.to(eventUid).emit("conversation", {
        ...event._doc,
        user: {
          _id: req.user._id,
          first_name: req.user.first_name,
          profile_image: req.user.profile_image,
        },
      });

      if (!event) {
        message = "Conversation create Failed! Please Try again.";
        return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
      }

      return responseHandler.returnSuccess(httpStatus.CREATED, message, result);
    } catch (e) {
      logger.error(e);
      return responseHandler.returnError(
        httpStatus.BAD_REQUEST,
        "Something went wrong!"
      );
    }
  };

  getConversationList = async (req) => {
    const { page, perPage, orderBy, searchKey } = prepareCommonQueryParams(
      req?.query
    );

    const eventParticipent = await this.eventParticipentDao.findOne({event_uid: req.params.eventUid , user_uid:req.user._id, group_status: "UNBLOCK"})

    if (!eventParticipent) {
      return responseHandler.returnError(
        httpStatus.UNAUTHORIZED,
        "Not authorized",
        null
      );
    }
    let searchCriteria = {}; // Initialize search criteria

    // Define your search criteria here
    if (searchKey) {
      searchCriteria = {
        title: { $regex: searchKey, $options: "i" }, // 'i' for case-insensitive
      };
    }
    searchCriteria.eventUid = req.params.eventUid;

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userUid",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          message: {
            $cond: {
              if: { $eq: ["$deleteStatus", true] },
              then: "Message Deleted",
              else: "$message",
            },
          },
        },
      },
      {
        $project: {
          message: 1,
          dynamicMessage: 1,
          eventUid: 1,
          _id: 1,
          userUid: 1,
          "user.first_name": 1,
          "user.profile_image": 1,
          "user.last_name": 1,
          "user._id": 1,
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
            $count: "totalDocuments",
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

    const results = await this.conversationDao.aggregate(pipeline);
    const { totalDocuments, totalPages } = this.calculatePaginationMetadata(
      results,
      perPage
    );

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

    return responseHandler.returnSuccess(
      httpStatus.OK,
      "Conversation data found",
      responseData
    );
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

  updateConversation = async (req) => {
    const { eventUid, title } = req.body;
    const event = await this.conversationDao.findById(eventUid);

    // If politic doesn't exist, return error
    if (!event) {
      return responseHandler.returnError(
        httpStatus.NOT_FOUND,
        "Conversation not found"
      );
    }

    const data = {
      title: title || event?.title,
      short_description: short_description || event?.short_description,
    };

    const filter = { _id: eventUid };
    // Save the updated language
    const updatedConversation = await this.conversationDao.updateOne(
      filter,
      data
    );

    if (updatedConversation) {
      // Return success response with updated language data
      return responseHandler.returnSuccess(
        httpStatus.OK,
        "Conversation updated successfully",
        updatedConversation
      );
    }
    return responseHandler.returnError(
      httpStatus.BAD_REQUEST,
      "Conversation update failed"
    );
  };

  deleteConversation = async (req) => {
    const conversation = await this.conversationDao.findById(
      req?.params?.conversationUid
    );

    // If politic doesn't exist, return error
    if (!conversation) {
      return responseHandler.returnError(
        httpStatus.NOT_FOUND,
        "Conversation not found"
      );
    }

    const data = {
      eventUid: conversation?.eventUid,
      message: conversation?.message,
      userUid: conversation?.userUid,
      deleteStatus: true,
    };

    const filter = { _id: req?.params?.conversationUid };
    // Save the updated language
    const updatedConversation = await this.conversationDao.updateOne(
      filter,
      data
    );

    if (updatedConversation) {
      // Return success response with updated language data
      return responseHandler.returnSuccess(
        httpStatus.OK,
        "Conversation deleted successfully",
        updatedConversation
      );
    }
    return responseHandler.returnError(
      httpStatus.BAD_REQUEST,
      "Conversation delete failed"
    );
  };

  //  getDiscoverConversation = async (req) => {
  //     const { page, perPage, orderBy, searchKey, interest,gender, minAge, maxAge } = prepareCommonQueryParams(req?.query);
  //     let searchCriteria = {};

  //     // Define your search criteria here
  //     if (searchKey) {
  //         searchCriteria.title = { $regex: searchKey, $options: 'i' }; // 'i' for case-insensitive
  //     }
  //     if(gender){
  //         searchCriteria.gender = { $regex: gender, $options: 'i' }
  //     }
  //     if(minAge && maxAge){
  //         searchCriteria = {...searchCriteria, $and:[{ start_age: { $lte: parseInt(maxAge) } },
  //             { end_age: { $gte: parseInt(minAge) } }]}
  //     }

  //     const pipeline = [
  //         {
  //             $geoNear: {
  //                 near: { type: 'Point', coordinates: req?.user?.location?.coordinates },
  //                 distanceField: 'distance',
  //                 spherical: true,
  //                 maxDistance: 30000
  //             }
  //         },
  //         {
  //             $match: searchCriteria
  //         },
  //         {
  //             $lookup: {
  //                 from: 'categories',
  //                 localField: 'category',
  //                 foreignField: '_id',
  //                 as: 'category',
  //             }
  //         },
  //         {
  //             $lookup: {
  //                 from: 'users',
  //                 localField: 'user_uid',
  //                 foreignField: '_id',
  //                 as: 'user',
  //             }
  //         },
  //         {
  //             $unwind: {
  //                 path: '$user',
  //                 preserveNullAndEmptyArrays: false
  //             }
  //         },
  //         {
  //             $lookup: {
  //                 from: 'languages',
  //                 localField: 'language',
  //                 foreignField: '_id',
  //                 as: 'language',
  //             }
  //         },
  //         {
  //             $project: {
  //                 city: 1,
  //                 country: 1,
  //                 category: 1,
  //                 _id: 1,
  //                 user_uid: 1,
  //                 notice_hour: 1,
  //                 title: 1,
  //                 event_date: 1,
  //                 thumbnail: 1,
  //                 start_time: 1,
  //                 language: 1,
  //                 location: 1,
  //                 distance: 1,
  //                 interests: 1,
  //                 gender:1,
  //                 start_age:1,
  //                 end_age:1,
  //                 'user.first_name': 1,
  //                 'user.profile_image': 1,
  //                 'user.last_name': 1,
  //                 'user._id': 1,
  //             }
  //         },
  //         {
  //             $sort: orderBy
  //         }
  //     ];

  //     pipeline.push({
  //         $facet: {
  //             data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
  //             metaData: [
  //                 {
  //                     $count: 'totalDocuments',
  //                 },
  //                 {
  //                     $addFields: {
  //                         page,
  //                         perPage,
  //                     },
  //                 },
  //             ],
  //         },
  //     });

  //     const results = await this.conversationDao.aggregate(pipeline);
  //     const { totalDocuments, totalPages } = this.calculatePaginationMetadata(results, perPage);

  //     // Prepare metadata object
  //     const metadata = {
  //         totalDocuments,
  //         totalPages,
  //         currentPage: page,
  //         perPage,
  //     };

  //     // Return results along with metadata
  //     const responseData = {
  //         data: results[0].data,
  //         metadata,
  //     };
  //     return responseHandler.returnSuccess(httpStatus.OK, 'Conversation data found', responseData);
  // };
}

module.exports = ConversationService;
