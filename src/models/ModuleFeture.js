// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const moduleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            max: 50,
        },
        slug: {
            type: String,
            required: false,
            max: 60,
        },
        permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    },
    {
        timestamps: true,
    },
);
const ModuleFeture = mongoose.model('ModuleFetures', moduleSchema);
module.exports = ModuleFeture;
