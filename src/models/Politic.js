// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const politic = new mongoose.Schema(
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
const Politic = mongoose.model('Politic', politic);
module.exports = Politic;
