// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const eventParticipent = new mongoose.Schema(
    {
        event_uid: { type: Schema.Types.ObjectId, ref: 'Event' },
        user_uid: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPEND'],
            default: 'PENDING',
        },
        block: {
            type: Boolean,
            required: false,
            default: false,
        },
        leave: {
            type: Boolean,
            required: false,
            default: false,
        },
        group_status: {
            type: String,
            enum: ['LEAVE', 'BLOCK', 'UNBLOCK'],
            required: false,
            default: 'UNBLOCK',
        },
    },
    {
        timestamps: true,
    },
);
const EventParticipent = mongoose.model('EventParticipent', eventParticipent);
module.exports = EventParticipent;
