// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const { Schema } = mongoose;

const placeSchema = new Schema(
    {
        owner: {
            type: String,
            required: true,
        },
        interests: [{ type: Schema.Types.ObjectId, ref: 'Interest' }],
        phone_number: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        place_name: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        address_line: {
            type: String,
            required: true,
        },
        lat: {
            type: String,
            required: true,
        },
        long: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
