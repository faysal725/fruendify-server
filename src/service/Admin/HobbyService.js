/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Hobby = require('../../models/Hobby');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class HobbyService {
    constructor() {
        this.HobbyDao = Hobby;
    }

    createHobby = async (req) => {
        const { title } = req.body;
        const data = {
            title,
        };

        const hobby = new this.HobbyDao(data);

        const result = await hobby.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Hobby created successfully',
            result,
        );
    };

    updateHobby = async (req) => {
        const { title, hobbyUid } = req.body;

        const hobby = await this.HobbyDao.findById(hobbyUid);

        // If hobby doesn't exist, return error
        if (!hobby) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Hobby not found');
        }

        // Update role properties
        hobby.title = title;

        // Save the updated hobby
        const updatedHobby = await hobby.save();

        if (updatedHobby) {
            // Return success response with updated hobby data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Hobby updated successfully',
                updatedHobby,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Hobby update failed');
    };

    getHobbyList = async (req) => {
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

        const pipeline = [{ $sort: orderBy }];

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

        const results = await this.HobbyDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Hobby data found', responseData);
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

    deleteHobby = async (req) => {
        const response = await this.HobbyDao.deleteOne({
            _id: req.params.hobbyUid,
        });
        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Hobby deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Hobby delete failed');
    };

    deleteMultipleHobby = async (req) => {
        const { hobbyUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.HobbyDao.deleteMany({ _id: { $in: hobbyUuids } });

        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Hobby deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Hobby delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.HobbyDao.findById(req.params.hobbyUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Hobby data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Hobby data not found');
    };
}

module.exports = HobbyService;
