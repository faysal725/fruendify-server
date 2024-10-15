// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const language = new mongoose.Schema(
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
const Language = mongoose.model('Language', language);
module.exports = Language;
