// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const userImage = new mongoose.Schema(
    {
        user_uuid: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        image: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
const UserImage = mongoose.model('UserImage', userImage);
module.exports = UserImage;
