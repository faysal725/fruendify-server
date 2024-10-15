/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Music = require('../../models/Music');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class DietService {
    constructor() {
        this.MusicDao = Music;
    }

    createMusic = async (req) => {
        const { title } = req.body;
        const data = {
            title,
        };

        const diet = new this.MusicDao(data);

        const result = await diet.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Music created successfully',
            result,
        );
    };

    updateMusic = async (req) => {
        const { title, musicUid } = req.body;

        const music = await this.MusicDao.findById(musicUid);

        if (!music) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Music not found');
        }

        music.title = title;

        const updatedDiet = await music.save();

        if (updatedDiet) {
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Music updated successfully',
                updatedDiet,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Music update failed');
    };

    getMusicList = async (req) => {
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

        const results = await this.MusicDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Music data found', responseData);
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

    deleteMusic = async (req) => {
        const response = await this.MusicDao.deleteOne({
            _id: req.params.musicUid,
        });
        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Music deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Music delete failed');
    };

    deleteMultipleMusic = async (req) => {
        const { musicUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.MusicDao.deleteMany({ _id: { $in: musicUuids } });

        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Music deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Music delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.MusicDao.findById(req.params.musicUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Music data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Music data not found');
    };
}

module.exports = DietService;
