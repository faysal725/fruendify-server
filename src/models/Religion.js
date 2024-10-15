// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const religion = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
const Religion = mongoose.model('Religion', religion);
module.exports = Religion;
