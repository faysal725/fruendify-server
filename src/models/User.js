// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const user = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: false,
        },
        last_name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: false,
        },
        age: {
            type: Number,
            required: false,
        },
        interests: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Interest',
                required: false,
            },
        ],
        hobbies: [{ type: Schema.Types.ObjectId, ref: 'Hobby' }],
        education: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
        diet: [{ type: Schema.Types.ObjectId, ref: 'Diet' }],
        languages: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
        industry: [{ type: Schema.Types.ObjectId, ref: 'Industry' }],
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: false,
                index: { type: '2dsphere', sparse: true },
            },
            coordinates: {
                type: [Number],
                required: false,
            },
        },
        maritial_status: {
            type: String,
            required: false,
        },
        religion: {
            type: Schema.Types.ObjectId,
            ref: 'Religion',
            required: false,
        },
        drinks: {
            type: Boolean,
            required: false,
        },
        smoke: {
            type: Boolean,
            required: false,
        },
        sport: {
            type: Boolean,
            required: false,
            default: false,
        },
        status: {
            type: Number,
            required: false,
        },
        email_verified: {
            type: Number,
            required: false,
            default: 0,
        },
        address: {
            type: String,
            required: false,
        },
        phone_number: {
            type: String,
            required: false,
        },
        email_registered: {
            type: Boolean,
            required: false,
            default: false,
        },
        registered_token: {
            type: String,
            required: false,
        },
        profile_image: {
            type: String,
            required: false,
        },
        images: {
            type: Array,
            required: false,
        },
        birth_date: {
            type: Date,
            required: false,
        },
        gender: {
            type: String,
            required: false,
        },
        height: {
            type: Number,
            required: false,
        },
        weight: {
            type: Number,
            required: false,
        },
        want_to_meet: {
            type: Array,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        is_verified: {
            type: Boolean,
            required: false,
        },
        journey_mode: {
            type: Boolean,
            required: false,
            default: false,
        },
        stage_number: {
            type: Number,
            required: false,
            default: 0,
        },
        profile_completed: {
            type: Number,
            required: false,
            default: 0,
        },
        about_fruendify: {
            type: String,
            required: false,
        },
        job_title: {
            type: String,
            required: false,
        },
        experience: {
            type: Number,
            required: false,
        },
        job_description: {
            type: String,
            required: false,
        },
        provider_id: {
            type: String,
            required: false,
        },
        friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        joining_reason: {
            type: String,
            required: false,
        },
        road: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
        timezone: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

user.index({ location: '2dsphere' });

const User = mongoose.model('User', user);
module.exports = User;
