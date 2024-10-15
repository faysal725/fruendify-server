/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
const path = require('path');
const Otp = require('../../models/Otp');
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const responseHandler = require('../../helper/responseHandler');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');
const { checkFileType } = require('../../helper/UtilityHelper');

class AdminService {
    constructor() {
        this.userDao = User;
        this.AdminDao = Admin;
        this.otp = Otp;
    }

    getAdminData = async (uuid) => {
        const result = await this.AdminDao.findById(uuid)
            .select('-password')
            .populate('role_uid', 'name');

        return responseHandler.returnSuccess(httpStatus.CREATED, 'User data found', result);
    };

    createStaff = async (req) => {
        const {
            first_name,
            last_name = null,
            email,
            password,
            role_uid,
            status,
            phone_number,
        } = req.body;

        const userId = req.user._id;
        const hashPassword = bcrypt.hashSync(password, 8);

        const data = {
            first_name,
            last_name,
            email,
            password: hashPassword,
            role_uid,
            phone_number,
            status,
            parent_uid: userId,
        };

        const adminStaff = new this.AdminDao(data);

        // adminStaff.role_uid = role_uid;
        const response = await adminStaff.save();

        if (response) {
            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                'User created successfully',
                response,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'User create failed');
    };

    updateAdmin = async (req) => {
        const {
            userUid,
            first_name,
            last_name = null,
            email,
            password,
            role_uid,
            status,
            phone_number,
        } = req.body;

        const user = await this.AdminDao.findById(userUid);

        // If role doesn't exist, return error
        if (!user) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'User not found');
        }

        let hashPassword = null;
        if (password) {
            hashPassword = bcrypt.hashSync(password, 8);
        }
        // Update role properties
        user.first_name = first_name || user.first_name;
        user.last_name = last_name || user.last_name;
        user.email = email || user.email;
        user.role_uid = role_uid || user.role_uid;
        user.status = status || user.status;
        user.phone_number = phone_number || user.phone_number;
        user.password = hashPassword || user.password;

        // Save the updated role
        const updatedUser = await user.save();

        if (updatedUser) {
            // Return success response with updated role data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'User updated successfully',
                updatedUser,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'User update failed');
    };

    getAdminList = async (req) => {
        const { page, perPage, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria

        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                $or: [
                    {
                        full_name: {
                            $regex: searchKey,
                            $options: 'i',
                        },
                    },
                    {
                        email: {
                            $regex: searchKey,
                            $options: 'i',
                        },
                    },
                ],
            };
        }

        const pipeline = [
            {
                $addFields: {
                    full_name: {
                        $concat: ['$first_name', ' ', '$last_name'],
                    },
                },
            },
            {
                $lookup: {
                    from: 'roles', // Assuming the name of the permissions collection
                    localField: 'role_uid',
                    foreignField: '_id',
                    as: 'role',
                },
            },
            { $sort: orderBy },
            {
                $addFields: {
                    role: { $arrayElemAt: ['$role', 0] }, // Extract the first element from the 'role' array
                },
            },
            {
                $project: {
                    // Add more fields as needed
                    password: 0, // Exclude fields you don't want to include
                },
            },
        ];

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

        const results = await this.AdminDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Admin data found', responseData);
    };

    deleteAdmin = async (req) => {
        const response = await this.AdminDao.deleteOne({
            _id: req.params.userUid,
        });
        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'User deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'User delete failed');
    };

    deleteMultipleAdmin = async (req) => {
        const { userUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.AdminDao.deleteMany({ _id: { $in: userUuids } });

        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Users deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Users delete failed');
    };

    // eslint-disable-next-line class-methods-use-this
    uploadFile = async (req, res) => {
        try {
            // Configure storage engine and filename
            const storage = multer.diskStorage({
                destination: `${process.env.PWD}/public`,
                filename(req, file, cb) {
                    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
                },
            });

            // Initialize upload middleware and add file size limit
            const upload = multer({
                storage,
                limits: { fileSize: 1000000 }, // 1MB file size limit
                fileFilter(req, file, cb) {
                    checkFileType(file, cb);
                },
            }).single('myFile'); // 'myFile' is the name attribute of the file input field

            upload(req, res, (err) => {
                if (err) {
                    console.log('clg in eror');
                    console.error(err);
                    return responseHandler.returnSuccess(500, err);
                }
                if (!req.file) {
                    return responseHandler.returnSuccess(500, 'Please send file');
                }
                console.log(req.file);
                return responseHandler.returnSuccess(httpStatus.CREATED, 'File Uploaded');
            });

            return responseHandler.returnSuccess(httpStatus.CREATED, 'File Uploaded');
        } catch (error) {
            console.error('Error in uploadFile:', error);
            return responseHandler.returnError(res, 500, 'Internal server error');
        }
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
}

module.exports = AdminService;
