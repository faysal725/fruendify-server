// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const admin = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role_uid: {
            type: Schema.Types.ObjectId,
            ref: 'Role',
            required: false,
        },
        parent_uid: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: false,
        },
        status: {
            type: Number,
            required: false,
            default: 1,
        },
        email_verified: {
            type: Number,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        phone_number: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);
const Admin = mongoose.model('Admin', admin);
module.exports = Admin;
