// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const education = new mongoose.Schema(
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
const Education = mongoose.model('Education', education);
module.exports = Education;
