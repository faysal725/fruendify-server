const express = require('express');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
// eslint-disable-next-line import/no-extraneous-dependencies
const fileUpload = require('express-fileupload');
const routes = require('./route');
const { jwtStrategy, adminJwtStrategy } = require('./config/passport');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./helper/ApiError');

process.env.PWD = process.cwd();

const app = express();

// enable cors
app.use(cors());
app.options('*', cors());
app.use(fileUpload());

app.use(express.static(`${process.env.PWD}/public`));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
passport.use('admin-jwt', adminJwtStrategy);

app.get('/test/auth', async (req, res) => {
    res.status(200).send('Congratulations! API is working!');
});
app.use('/api', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
