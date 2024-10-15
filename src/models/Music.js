// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const music = new mongoose.Schema(
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
const Music = mongoose.model('Music', music);
module.exports = Music;
