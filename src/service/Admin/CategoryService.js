/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');
const responseHandler = require('../../helper/responseHandler');
const Category = require('../../models/Category');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class CategoryService {
    constructor() {
        this.CategoryDao = Category;
    }

    createCategory = async (req) => {
        const { title } = req.body;

        let relativePath = null;
        if (req.files?.file) {
            const image = req.files.file;

            const imageUpload = await CategoryService.moveFile(image);
            const baseDir = 'public';
            relativePath = CategoryService.getRelativePath(imageUpload, baseDir);
        }

        const data = {
            title,
            type: 1,
            image: relativePath,
        };
        const politic = new this.CategoryDao(data);

        const result = await politic.save();

        return responseHandler.returnSuccess(
            httpStatus.CREATED,
            'Category created successfully',
            result,
        );
    };

    updateCategory = async (req) => {
        const { title, categoryUid } = req.body;

        const category = await this.CategoryDao.findById(categoryUid);

        if (!category) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Category not found');
        }

        let relativePath = category?.image;
        if (req.files?.file) {
            const image = req.files.file;

            const imageUpload = await CategoryService.moveFile(image);
            const baseDir = 'public';
            relativePath = CategoryService.getRelativePath(imageUpload, baseDir);
        }

        category.title = title;
        category.image = relativePath;

        const updatedCategory = await category.save();

        if (updatedCategory) {
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Category updated successfully',
                updatedCategory,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Category update failed');
    };

    getCategoryList = async (req) => {
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

        const results = await this.CategoryDao.aggregate(pipeline);
        // console.log(results, 'results');
        const domain = process.env.MAIN_DOMAIN;
        const modifiedData = results[0].data.map((category) => {
            return {
                ...category,
                image: domain + category.image,
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Category data found', responseData);
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

    deleteCategory = async (req) => {
        const response = await this.CategoryDao.deleteOne({
            _id: req.params.categoryUid,
        });
        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Category deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Category delete failed');
    };

    deleteMultipleCategory = async (req) => {
        const { categoryUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.CategoryDao.deleteMany({ _id: { $in: categoryUuids } });

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'Category deleted successfully',
            );
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Category delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.CategoryDao.findById(req.params.categoryUid);

        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Category data found', result);
        }
        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Category data not found');
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

module.exports = CategoryService;
