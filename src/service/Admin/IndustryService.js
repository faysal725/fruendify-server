/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Industry = require('../../models/Industry');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class IndustryService {
    constructor() {
        this.IndustryDao = Industry;
    }

    createIndustry = async (req) => {
        const { title } = req.body;
        const data = {
            title,
        };

        const industry = new this.IndustryDao(data);

        const result = await industry.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Industry created successfully',
            result,
        );
    };

    updateIndustry = async (req) => {
        const { title, industryUid } = req.body;

        const industry = await this.IndustryDao.findById(industryUid);

        if (!industry) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Industry not found');
        }

        industry.title = title;

        const updatedIndustry = await industry.save();

        if (updatedIndustry) {
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Industry updated successfully',
                updatedIndustry,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Industry update failed');
    };

    getIndustryList = async (req) => {
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

        const results = await this.IndustryDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Industry data found', responseData);
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

    deleteIndustry = async (req) => {
        const response = await this.IndustryDao.deleteOne({
            _id: req.params.industryUid,
        });
        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Industry deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Industry delete failed');
    };

    deleteMultipleIndustry = async (req) => {
        const { industryUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.IndustryDao.deleteMany({ _id: { $in: industryUuids } });

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Industry deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Industry delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.IndustryDao.findById(req.params.industryUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Industry data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Industry data not found');
    };
}

module.exports = IndustryService;
