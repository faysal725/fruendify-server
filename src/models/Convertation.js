// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const convertation = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        event_uid: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
const Convertation = mongoose.model('Convertation', convertation);
module.exports = Convertation;
