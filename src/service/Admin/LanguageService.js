/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Language = require('../../models/Language');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class LanguageService {
    constructor() {
        this.LanguageDao = Language;
    }

    createLanguage = async (req) => {
        const { title } = req.body;
        const data = {
            title,
        };

        const language = new this.LanguageDao(data);

        const result = await language.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Language created successfully',
            result,
        );
    };

    updateLanguage = async (req) => {
        const { title, languageUid } = req.body;

        const language = await this.LanguageDao.findById(languageUid);

        // If language doesn't exist, return error
        if (!language) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Language not found');
        }

        // Update language properties
        language.title = title;

        // Save the updated hobby
        const updatedHobby = await language.save();

        if (updatedHobby) {
            // Return success response with updated hobby data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Language updated successfully',
                updatedHobby,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Language update failed');
    };

    getLanguageList = async (req) => {
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

        const results = await this.LanguageDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Language data found', responseData);
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

    deleteLanguage = async (req) => {
        const response = await this.LanguageDao.deleteOne({
            _id: req.params.languageUid,
        });
        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Language deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Language delete failed');
    };

    deleteMultipleLanguage = async (req) => {
        const { languageUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.LanguageDao.deleteMany({ _id: { $in: languageUuids } });

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Language deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Language delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.LanguageDao.findById(req.params.languageUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Language data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Language data not found');
    };
}

module.exports = LanguageService;
