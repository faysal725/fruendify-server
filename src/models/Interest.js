// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const interest = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);
const Interest = mongoose.model('Interest', interest);
module.exports = Interest;
