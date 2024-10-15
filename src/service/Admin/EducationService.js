/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Education = require('../../models/Education');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class LanguageService {
    constructor() {
        this.EducationDao = Education;
    }

    createEducation = async (req) => {
        const { title } = req.body;
        const data = {
            title,
        };

        const language = new this.EducationDao(data);

        const result = await language.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Education created successfully',
            result,
        );
    };

    updateEducation = async (req) => {
        const { title, educationUid } = req.body;

        const education = await this.EducationDao.findById(educationUid);

        // If education doesn't exist, return error
        if (!education) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Education not found');
        }

        // Update language properties
        education.title = title;

        // Save the updated language
        const updatedHobby = await education.save();

        if (updatedHobby) {
            // Return success response with updated language data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Education updated successfully',
                updatedHobby,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Education update failed');
    };

    getEducationList = async (req) => {
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

        const results = await this.EducationDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Education data found', responseData);
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

    deleteEducation = async (req) => {
        const response = await this.EducationDao.deleteOne({
            _id: req.params.educationUid,
        });
        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Education deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Education delete failed');
    };

    deleteMultipleEducation = async (req) => {
        const { educationUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.EducationDao.deleteMany({ _id: { $in: educationUuids } });

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Education deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Education delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.EducationDao.findById(req.params.educationUid);

        if (result) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Education data found',
                result,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Education data not found');
    };
}

module.exports = LanguageService;
