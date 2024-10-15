// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const conversation = new mongoose.Schema(
    {
        eventUid: { type: String, required: true },
        message: {
            type: String,
            required: true,
        },
        userUid: { type: Schema.Types.ObjectId, ref: 'User' }, //
        deleteStatus: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);
const Conversation = mongoose.model('Conversation', conversation);
module.exports = Conversation;
