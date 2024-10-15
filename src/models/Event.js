// eslint-disable-next-line import/no-extraneous-dependencies
const { mongoose, Schema } = require('mongoose');

const event = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            max: 50,
        },
        short_description: {
            type: String,
            required: true,
        },
        event_date: {
            type: Date,
            required: false,
        },
        event_date_time: {
            type: Date,
            required: false,
        },
        number_of_people: {
            type: Number,
            required: false,
        },
        start_time: {
            type: String,
            required: true,
        },
        notice_hour: {
            type: Date,
            required: false,
        },
        notice_hour_slot: {
            type: String,
            enum: ['HOUR', 'DAY'],
            default: 'DAY',
        },
        user_uid: { type: Schema.Types.ObjectId, ref: 'User' }, //
        interests: [{ type: Schema.Types.ObjectId, ref: 'Interest' }],
        address: {
            type: String,
            required: false,
        },
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
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Non-binary', 'Others', 'All'],
            required: true,
        },
        start_age: {
            type: Number,
            required: false,
        },
        end_age: {
            type: Number,
            required: false,
        },
        diet: [{ type: Schema.Types.ObjectId, ref: 'Diet' }],
        language: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
        education: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
        carrier: [{ type: Schema.Types.ObjectId, ref: 'Industry' }],
        hobbies: [{ type: Schema.Types.ObjectId, ref: 'Hobby' }],
        music: [{ type: Schema.Types.ObjectId, ref: 'Music' }],
        politic: [{ type: Schema.Types.ObjectId, ref: 'Politic' }],
        relationship_status: {
            type: String,
            required: false,
        },
        drink: {
            type: String,
            required: false,
        },
        is_athlete: {
            type: Boolean,
            required: false,
            default: false,
        },
        smoke: {
            type: String,
            required: false,
        },
        face_blur: {
            type: Boolean,
            required: false,
            default: false,
        },
        religion: [{ type: Schema.Types.ObjectId, ref: 'Religion' }],
        category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        thumbnail: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE', 'SUSPEND'],
            default: 'ACTIVE',
        },
        evenet_activities: {
            type: String,
            required: false,
        },
        created_by: {
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
        neighbourhood: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);
const Event = mongoose.model('Event', event);
module.exports = Event;
