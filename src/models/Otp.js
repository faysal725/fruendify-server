// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        otp: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        is_used: {
            type: Boolean,
            required: false,
            default: false,
        },
        expired_time: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);
// otpSchema.plugin(timeZone, { paths: ["date", "subDocument.subDate"] });
const Otp = mongoose.model('otp', otpSchema);
module.exports = Otp;
