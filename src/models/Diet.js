// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const diet = new mongoose.Schema(
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
const Diet = mongoose.model('Diet', diet);
module.exports = Diet;
