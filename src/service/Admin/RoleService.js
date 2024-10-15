/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const Admin = require('../../models/Admin');
const responseHandler = require('../../helper/responseHandler');
const Role = require('../../models/Role');
const ModuleFeture = require('../../models/ModuleFeture');
const Permission = require('../../models/Permission');
const { generateSlug } = require('../../helper/UtilityHelper');
const { prepareCommonQueryParams } = require('../../helper/requestHandlerHelper');

class RoleService {
    constructor() {
        this.AdminDao = Admin;
        this.RoleDao = Role;
        this.ModuleDao = ModuleFeture;
        this.PermissionDao = Permission;
    }

    createRole = async (req) => {
        const { name, permissions } = req.body;
        const data = {
            name,
            slug: generateSlug(name),
        };

        const role = new this.RoleDao(data);
        if (permissions.length) {
            // eslint-disable-next-line array-callback-return
            permissions.forEach((element) => {
                role.permissions.push(element);
            });
        }

        const result = await role.save();

        return responseHandler.returnSuccess(httpStatus.CREATED, 'message', result);
    };

    updateRole = async (req) => {
        const { name, permissions, roleUid } = req.body;

        const role = await this.RoleDao.findById(roleUid);

        // If role doesn't exist, return error
        if (!role) {
            return responseHandler.returnError(httpStatus.NOT_FOUND, 'Role not found');
        }

        // Update role properties
        role.name = name;
        role.slug = generateSlug(name); // Assuming generateSlug is defined elsewhere

        // Clear existing permissions and add new ones
        role.permissions = permissions;

        // Save the updated role
        const updatedRole = await role.save();

        if (updatedRole) {
            // Return success response with updated role data
            return responseHandler.returnSuccess(
                httpStatus.OK,
                'Role updated successfully',
                updatedRole,
            );
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Role update failed');
    };

    createModule = async (req) => {
        const { name, permissions } = req.body;
        const data = {
            name,
            slug: generateSlug(name),
        };

        const module = new this.ModuleDao(data);
        if (permissions.length) {
            // eslint-disable-next-line array-callback-return
            permissions.forEach((element) => {
                module.permissions.push(element);
            });
        }
        const result = await module.save();
        if (result) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Module created', result);
        }

        return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Module create failed');
    };

    getRoleList = async (req) => {
        const { page, perPage, orderBy, searchKey } = prepareCommonQueryParams(req?.query);
        let searchCriteria = {}; // Initialize search criteria

        // Define your search criteria here
        // Example: search for roles with a specific name
        // const searchKeyword = ''; // Define your search keyword
        if (searchKey) {
            searchCriteria = {
                name: { $regex: searchKey, $options: 'i' }, // 'i' for case-insensitive
            };
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'permissions', // Assuming the name of the permissions collection
                    localField: 'permissions',
                    foreignField: '_id',
                    as: 'permissions',
                },
            },
            { $sort: orderBy },
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

        const results = await this.RoleDao.aggregate(pipeline);
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
        return responseHandler.returnSuccess(httpStatus.OK, 'Role data found', responseData);
    };

    getModuleList = async () => {
        const results = await this.ModuleDao.find().populate('permissions');

        return responseHandler.returnSuccess(httpStatus.OK, 'Module data found', results);
    };

    getPermissionList = async () => {
        const page = 1;
        const perPage = 1;
        const permissions = await this.PermissionDao.find()
            .skip((page - 1) * perPage)
            .limit(perPage);

        return responseHandler.returnSuccess(httpStatus.OK, 'message', permissions);
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

    // eslint-disable-next-line class-methods-use-this
    createModuleSeeder = async () => {
        const data = [
            {
                module: 'Category',
                permissions: [
                    {
                        title: 'Category create',
                    },
                    {
                        title: 'Category delete',
                    },
                    {
                        title: 'Category update',
                    },
                ],
            },
            {
                module: 'Interest',
                permissions: [
                    {
                        title: 'Interest create',
                    },
                    {
                        title: 'Interest delete',
                    },
                    {
                        title: 'Interest update',
                    },
                ],
            },
            {
                module: 'Hobby',
                permissions: [
                    {
                        title: 'Hobby create',
                    },
                    {
                        title: 'Hobby delete',
                    },
                    {
                        title: 'Hobby update',
                    },
                ],
            },
        ];

        // Iterate over each item in the data array
        // Iterate over each item in the data array using forEach
        data.forEach(async (item) => {
            // Create permissions for the module
            const permissionCreated = await Promise.all(
                item.permissions.map(async (permission) => {
                    const permissionData = {
                        name: permission.title,
                        slug: generateSlug(permission.title),
                    };
                    const permissionObj = new this.PermissionDao(permissionData);
                    const result = await permissionObj.save();
                    return result._id;
                }),
            );

            console.log(permissionCreated, 'permissionCreated');
            const moduleData = {
                name: item.module,
                slug: generateSlug(item.module),
            };
            const module = new this.ModuleDao(moduleData);

            if (permissionCreated.length) {
                // eslint-disable-next-line array-callback-return
                permissionCreated.forEach((element) => {
                    module.permissions.push(element);
                });
            }
            // Create module feature and associate permissions
            await module.save();

            console.log(`Module Feature "${item.module}" seeded successfully.`);
        });
    };

    deleteRole = async (req) => {
        const response = await this.RoleDao.deleteOne({
            _id: req.params.roluUid,
        });
        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Role deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Role delete failed');
    };

    deleteMultipleRole = async (req) => {
        const { roleUuids } = req.body; // Assuming the request body contains an array of ObjectId values under the key 'ids'

        // Use deleteMany to delete multiple documents by ObjectId
        const response = await this.RoleDao.deleteMany({ _id: { $in: roleUuids } });

        if (response) {
            return responseHandler.returnSuccess(httpStatus.CREATED, 'Role deleted successfully');
        }
        return responseHandler.returnError(httpStatus.BAD_GATEWAY, 'Role delete failed');
    };

    getSpecificData = async (req) => {
        const result = await this.RoleDao.findById(req.params.roluUid).populate('permissions');

        return responseHandler.returnSuccess(httpStatus.CREATED, 'Role data found', result);
    };
}

module.exports = RoleService;
