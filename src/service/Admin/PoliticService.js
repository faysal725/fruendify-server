/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Politic = require('../../models/Politic');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class PoliticService {
    constructor() {
        this.PoliticDao = Politic;
    }

    createPolitic = async (req) => {
        const { title } = req.body;
        const data = {
            title,
        };

        const politic = new this.PoliticDao(data);

        const result = await politic.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Politic created successfully',
            result,
        );
    };

    updatePolitic = async (req) => {
        const { title, politicUid } = req.body;

        const politic = await this.PoliticDao.findById(politicUid);

        // If politic doesn't exist, return error
        if (!politic) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Politic not found');
        }

        // Update politic properties
        politic.title = title;

        // Save the updated language
        const updatedHobby = await politic.save();

        if (updatedHobby) {
            // Return success response with updated language data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Politic updated successfully',
                updatedHobby,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Politic update failed');
    };

    getPoliticList = async (req) => {
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

        const results = await this.PoliticDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Politic data found', responseData);
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

    deletePolitic = async (req) => {
        const response = await this.PoliticDao.deleteOne({
            _id: req.params.politicUid,
        });
        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Politic deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Politic delete failed');
    };

    deleteMultiplePolitic = async (req) => {
        const { politicUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.PoliticDao.deleteMany({ _id: { $in: politicUuids } });

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Politic deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Politic delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.PoliticDao.findById(req.params.politicUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Politic data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Politic data not found');
    };
}

module.exports = PoliticService;
