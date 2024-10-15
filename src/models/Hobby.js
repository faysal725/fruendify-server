// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const hobby = new mongoose.Schema(
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
const Hobby = mongoose.model('Hobby', hobby);
module.exports = Hobby;
