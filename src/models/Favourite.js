// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const favourite = new mongoose.Schema(
    {
        from_user: { type: Schema.Types.ObjectId, ref: 'User' },
        to_user: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
    },
);
const Favourite = mongoose.model('Favourite', favourite);
module.exports = Favourite;
