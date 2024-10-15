/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Diet = require('../../models/Diet');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class DietService {
    constructor() {
        this.DietDao = Diet;
    }

    createDiet = async (req) => {
        const { title } = req.body;

        const data = {
            title,
        };

        const diet = new this.DietDao(data);

        const result = await diet.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Diet created successfully',
            result,
        );
    };

    updateDiet = async (req) => {
        const { title, dietUid } = req.body;

        const diet = await this.DietDao.findById(dietUid);

        if (!diet) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Diet not found');
        }

        diet.title = title;

        const updatedDiet = await diet.save();

        if (updatedDiet) {
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Diet updated successfully',
                updatedDiet,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Diet update failed');
    };

    getDietList = async (req) => {
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

        const results = await this.DietDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Diet data found', responseData);
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

    deleteDiet = async (req) => {
        const response = await this.DietDao.deleteOne({
            _id: req.params.dietUid,
        });
        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Diet deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Diet delete failed');
    };

    deleteMultipleDiet = async (req) => {
        const { dietUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.DietDao.deleteMany({ _id: { $in: dietUuids } });

        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Diet deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Diet delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.DietDao.findById(req.params.categoryUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Diet data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Diet data not found');
    };
}

module.exports = DietService;
