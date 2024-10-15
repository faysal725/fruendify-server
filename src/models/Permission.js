// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const permission = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            max: 50,
        },
        slug: {
            type: String,
            required: false,
            max: 50,
        },
    },
    {
        timestamps: true,
    },
);
const Permission = mongoose.model('Permission', permission);
module.exports = Permission;
