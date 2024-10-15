// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const industry = new mongoose.Schema(
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
const Industry = mongoose.model('Industry', industry);
module.exports = Industry;
