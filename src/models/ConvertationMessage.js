// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const convertationMessage = new mongoose.Schema(
    {
        convertation_uid: {
            type: String,
            required: true,
        },
        user_uid: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
const ConvertationMessage = mongoose.model('ConvertationMessage', convertationMessage);
module.exports = ConvertationMessage;
