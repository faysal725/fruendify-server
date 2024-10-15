// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const notification = new mongoose.Schema(
    {
        user_uuid: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        type: {
            type: String,
            required: true,
        },
        send_to: {
            type: String,
            required: false,
        },
        send_from: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        text: {
            type: String,
            required: false,
        },
        data: {
            type: String,
            required: false,
        },
        is_seen: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);
const Notification = mongoose.model('Notification', notification);
module.exports = Notification;
