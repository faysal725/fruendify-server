// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const friendRequest = new mongoose.Schema(
    {
        from_user: { type: Schema.Types.ObjectId, ref: 'User' },
        to_user: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    },
    {
        timestamps: true,
    },
);
const FriendRequest = mongoose.model('FriendRequest', friendRequest);
module.exports = FriendRequest;
