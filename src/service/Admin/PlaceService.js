/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Place = require('../../models/Place');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class PlaceService {
    constructor() {
        this.PlaceDao = Place;
    }

    static getRelativePath(filePath, baseDir) {
        const absoluteBaseDir = path.resolve(baseDir);
        const absoluteFilePath = path.resolve(filePath);
        return path.relative(absoluteBaseDir, absoluteFilePath);
    }

    createPlace = async (req) => {
        const { owner, phone_number, email, place_name, interests, address_line, lat, long } =
            req.body;
        if (!req.files?.thumbnail) {
            return responseHandler.returnError(
                httpStatus.BAD_REQUEST,
                'Thumbnail image is required.',
            );
        }
        
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

        let thumbnailImage =null;
        if (req.files?.thumbnail) {
            thumbnailImage = await moveFile(req.files?.thumbnail);
            thumbnailImage = PlaceService.getRelativePath(thumbnailImage, 'public');
        }
        const data = {
            owner,
            phone_number,
            email,
            place_name,
            thumbnail: thumbnailImage,
            interests : Array.isArray(interests) ? interests : interests?.split(','),
            address_line,
            lat,
            long,
        };
        const place = new this.PlaceDao(data);
        const result = await place.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Place created successfully',
            result,
        );
    };

    updatePlace = async (req) => {
        const {
            owner,
            phone_number,
            email,
            place_name,
            thumbnail,
            interests ,
            address_line,
            lat,
            long,
            placeUid,
        } = req.body;

        const place = await this.PlaceDao.findById(placeUid);
        // If place doesn't exist, return error
         if (!place) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Place not found');
        }

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
            thumbnailImage = PlaceService.getRelativePath(thumbnailImage, 'public');
        }

        // Update place properties
        const data = {
            owner,
            phone_number,
            email,
            place_name,
            thumbnail: thumbnailImage ?? place?.thumbnail,
            interests : interests ? Array.isArray(interests) ? interests : interests?.split(',') : place?.interests,
            address_line,
            lat,
            long,
        };
        const filter = { _id: placeUid };
        // Save the updated place
        const updatedPlace = await this.PlaceDao.updateOne(filter, data);

        if (updatedPlace) {
            // Return success response with updated place data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Place updated successfully',
                updatedPlace,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Place update failed');
    };

    getPlaceList = async (req) => {
        const { page, perPage, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria
        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                $or: [
                    { place_name: { $regex: searchKey, $options: 'i' } },
                    { owner: { $regex: searchKey, $options: 'i' } },
                    { address_line: { $regex: searchKey, $options: 'i' } },
                ],
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

        const results = await this.PlaceDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Place data found', responseData);
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

    deletePlace = async (req) => {
        const response = await this.PlaceDao.deleteOne({
            _id: req.params.placeUid,
        });
        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Place deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Place delete failed');
    };

    deleteMultiplePlace = async (req) => {
        const { placeUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.PlaceDao.deleteMany({ _id: { $in: placeUuids } });

        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Place deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Place delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.PlaceDao.findById(req.params.placeUid).populate('interests');

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Place data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Place data not found');
    };
}

module.exports = PlaceService;
