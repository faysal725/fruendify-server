// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const token = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
        },
        user_uuid: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            required: true,
        },
        user_type: {
            type: String,
            required: true,
        },
        expires: {
            type: Date,
            required: false,
        },
        blacklisted: {
            type: Boolean,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);
const Token = mongoose.model('Token', token);
module.exports = Token;
