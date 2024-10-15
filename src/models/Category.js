// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const category = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        type: {
            type: Number,
            required: false,
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
const Category = mongoose.model('Category', category);
module.exports = Category;
