/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');
const responseHandler = require('../../helper/responseHandler');
const Interest = require('../../models/Interest');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class InterestService {
    constructor() {
        this.InterestDao = Interest;
    }

    createInterest = async (req) => {
        const { title } = req.body;
        let relativePath = null;
        if (req.files?.file) {
            const image = req.files.file;

            const imageUpload = await InterestService.moveFile(image);
            const baseDir = 'public';
            relativePath = InterestService.getRelativePath(imageUpload, baseDir);
        }

        const data = {
            title,
            image: relativePath,
        };

        const interest = new this.InterestDao(data);

        const result = await interest.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Interest created successfully',
            result,
        );
    };

    updateInterest = async (req) => {
        const { title, interestUid } = req.body;

        const interest = await this.InterestDao.findById(interestUid);

        // If Interest doesn't exist, return error
        if (!interest) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Interest not found');
        }

        let relativePath = interest?.image;
        if (req.files?.file) {
            const image = req.files.file;

            const imageUpload = await InterestService.moveFile(image);
            const baseDir = 'public';
            relativePath = InterestService.getRelativePath(imageUpload, baseDir);
        }
        // Update Interest properties
        interest.title = title;
        interest.image = relativePath;

        // Save the updated Interest
        const updatedInterest = await interest.save();

        if (updatedInterest) {
            // Return success response with updated Interest data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Interest updated successfully',
                updatedInterest,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Interest update failed');
    };

    getInterestList = async (req) => {
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

        const results = await this.InterestDao.aggregate(pipeline);
        const domain = process.env.MAIN_DOMAIN;
        const modifiedData = results[0].data.map((category) => {
            const imageUrl = category.image ? domain + category.image : null;
            return {
                ...category,
                image: imageUrl,
            };
        });
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
            data: modifiedData,
            metadata,
        };
        return responseHandler.returnSuccess(httpStatus.OK, 'Interest data found', responseData);
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

    deleteInterest = async (req) => {
        const response = await this.InterestDao.deleteOne({
            _id: req.params.interestUid,
        });
        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Interest deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Interest delete failed');
    };

    deleteMultipleInterest = async (req) => {
        const { interestUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.InterestDao.deleteMany({ _id: { $in: interestUuids } });

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Interest deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Interest delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.InterestDao.findById(req.params.interestUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Interest data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Interest data not found');
    };

    getAllInterests = async () => {
        const results = await this.InterestDao.find();
        const domain = process.env.MAIN_DOMAIN;
        const modifiedData = results.map((category) => {
            const imageUrl = category.image ? domain + category.image : null;
            category.image = imageUrl;
            return category;
        });

        return responseHandler.returnSuccess(httpStatus.OK, 'Interest data found', modifiedData);
    };

    static moveFile = async (fileData) => {
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

    static getRelativePath(filePath, baseDir) {
        const absoluteBaseDir = path.resolve(baseDir);
        const absoluteFilePath = path.resolve(filePath);
        return path.relative(absoluteBaseDir, absoluteFilePath);
    }
}

module.exports = InterestService;
