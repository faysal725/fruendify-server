/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Religion = require('../../models/Religion');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class ReligionService {
    constructor() {
        this.ReligionDao = Religion;
    }

    createReligion = async (req) => {
        const { title } = req.body;
        const data = {
            title,
        };

        const politic = new this.ReligionDao(data);

        const result = await politic.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Religion created successfully',
            result,
        );
    };

    updateReligion = async (req) => {
        const { title, religionUid } = req.body;

        const religion = await this.ReligionDao.findById(religionUid);

        // If Religion doesn't exist, return error
        if (!religion) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Religion not found');
        }

        // Update Religion properties
        religion.title = title;

        // Save the updated Religion
        const updatedHobby = await religion.save();

        if (updatedHobby) {
            // Return success response with updated Religion data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Religion updated successfully',
                updatedHobby,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Religion update failed');
    };

    getReligionList = async (req) => {
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

        const results = await this.ReligionDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Religion data found', responseData);
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

    deleteReligion = async (req) => {
        const response = await this.ReligionDao.deleteOne({
            _id: req.params.religionUid,
        });
        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Religion deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Religion delete failed');
    };

    deleteMultipleReligion = async (req) => {
        const { religionUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.ReligionDao.deleteMany({ _id: { $in: religionUuids } });

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Religion deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Religion delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.ReligionDao.findById(req.params.religionUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Religion data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Religion data not found');
    };
}

module.exports = ReligionService;
