/* eslint-disable no-underscore-dangle */
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const cityTimezones = require('city-timezones');
// eslint-disable-next-line import/no-extraneous-dependencies
const { DateTime } = require('luxon');
const moment = require('moment');
const Otp = require('../models/Otp');
const EventParticipent = require('../models/EventParticipent');

const generateSlug = (str) => {
    return str
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Error: Images only! (jpeg, jpg, png, gif)');
};

const generateUniqueToken = async () => {
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const token = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit random number
        // Check if the token already exists in the database
        // eslint-disable-next-line no-await-in-loop
        const existingOtp = await Otp.findOne({ otp: token });

        if (!existingOtp) {
            return token; // Return the unique token if no duplicate found
        }

        // eslint-disable-next-line no-plusplus
        attempts++;
    }

    throw new Error('Failed to generate a unique token after multiple attempts.');
};

function generateExpiryDate() {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 5 * 60000); // Adding 2 minutes (2 * 60000 milliseconds)
    return expiryDate;
}

function generateRandomNumber() {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    return token;
}

const calculateProfileCompletion = (settings) => {
    let percentage = 0;

    if (settings.is_verified) {
        percentage += 40;
    }
    if (settings.description) {
        percentage += 10;
    }
    if (settings.birth_date) {
        percentage += 2;
    }

    if (settings.gender) {
        percentage += 2;
    }
    if (settings.religion) {
        percentage += 2;
    }
    if (settings.education) {
        percentage += 2;
    }
    if (settings.maritial_status) {
        percentage += 2;
    }

    if (settings.interests) {
        percentage += 20;
    }

    if (settings.smoke) {
        percentage += 2;
    }

    if (settings.drinks) {
        percentage += 2;
    }

    if (settings.diet) {
        percentage += 2;
    }

    if (settings.sport) {
        percentage += 2;
    }

    if (settings.height) {
        percentage += 2;
    }

    if (settings.languages) {
        percentage += 5;
    }

    if (settings.want_to_meet) {
        percentage += 5;
    }
    // Add more settings and their corresponding percentages as needed

    return percentage;
};

const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    // If the current month is before the birth month, or it's the birth month but the current day is before the birth day, subtract 1 from age
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
        // eslint-disable-next-line no-plusplus
        age--;
    }

    return age;
};

const mailTemplate = (otp) => {
    const html = `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Frunedify OTP Verification</title>
        <style>
            /* Inline CSS styles */
            body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            margin: 0; padding: 0; background-color: #f2f2f2;
            }
            table {
            width: 100%;
            border-collapse: collapse;
            }
            td {
            padding: 20px;
            }
            .otp-code {
            font-weight: bold;
            font-size: 24px;
            text-align: center;
            }
        </style>
        </head>
        <body>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff;">
            <tr>
            <td >
            <div style="text-align: center;">
        <img style="border-bottom: 1px dashed red;" src="https://i.ibb.co/ZdnDf8V/Whats-App-Image-2024-08-09-at-2-19-23-PM.jpg" alt="Frunedify Logo" width="200">
                
        </div>
                <h1 style="text-align: center;">OTP Verification</h1>
            </td>
            </tr>
            <tr>
            <td style="text-align: center;">
                <p>Your OTP is:</p>
                <p class="otp-code">${otp}</p>
            </td>
            </tr>
            <tr>
            <td style="text-align: center;">
                <p style="text-align: center;">This OTP is valid for 5 minutes.</p>
                <p style="text-align: center;">Please do not share this OTP with anyone.</p>
            </td>
            </tr>
            <tr>
            <td style="text-align: center;">
                <p>Copyright © Frunedify</p>
                <a href="https://www.frunedify.com">Visit our website</a>
            </td>
            </tr>
        </table>
        </body>
        </html>`;
    return html;
};

const getJoinableStatus = async (user, event) => {
    /**
     * Get participant event wise
     */
    const eventParticipent = await EventParticipent.findOne({
        user_uid: user._id,
        event_uid: event._id,
    });

    /**
     * Get participant count
     */
    const approvedEventParticipentCount = await EventParticipent.countDocuments({
        event_uid: event._id,
        status: 'APPROVED',
    });

    // const isFutureDateTimeGreater = true;
    // console.log(event.notice_hour, event.notice_hour_slot, 'notice_hour_slot');

    // if (event.event_date_time && event.notice_hour && event.notice_hour_slot) {
    //     const eventDateTime = moment(event.event_date_time);
    //     const userCurrentDateTime = moment(DateTime.now().setZone(user?.timezone).toString());
    //     console.log(event.event_date_time, eventDateTime, userCurrentDateTime, 'event');
    // }

    /**
     * Check event conditions
     */
    if (eventParticipent && approvedEventParticipentCount < event.number_of_people + 1) {
        return false;
    }
    return true;
};

const getCancelableStatus = async (user, event) => {
    /**
     * Get participant event wise
     */
    const eventParticipent = await EventParticipent.findOne({
        user_uid: user._id,
        event_uid: event._id,
    });

    const isEventActive = moment().isBefore(moment(event.event_date_time));

    if (eventParticipent && isEventActive) {
        return true;
    }
    return false;
};

const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    minutes = minutes == 0 ? '00' : minutes;

    // Ensure hours and minutes are in two-digit format
    return {
        toString: `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`,
        toTime: {
            hours,
            minutes,
        },
    };
};

const convertTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const years = date.getFullYear();
    const months = String(date.getMonth() + 1).padStart(2, '0');
    const days = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const data = {
        years,
        months,
        days,
        hours,
        minutes,
    };
    return data;
};

module.exports = {
    generateSlug,
    checkFileType,
    generateUniqueToken,
    generateExpiryDate,
    generateRandomNumber,
    calculateProfileCompletion,
    calculateAge,
    mailTemplate,
    getJoinableStatus,
    convertTo24Hour,
    convertTimestamp,
    getCancelableStatus,
};
