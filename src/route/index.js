const express = require('express');
const authRoute = require('./authRoute');
const adminAuthRoute = require('./adminAuthRoute');
const roleRoute = require('./roleRoute');
const hobbyRoute = require('./hobbyRoute');
const interestRoute = require('./interestRoute');
const eventRoute = require('./eventRoute');
const languageRoute = require('./languageRoute');
const educationRoute = require('./educationRoute');
const politicRoute = require('./politicRoute');
const religionRoute = require('./religionRoute');
const categoryRoute = require('./categoryRoute');
const musicRoute = require('./musicRoute');
const dietRoute = require('./dietRoute');
const industryRoute = require('./industryRoute');
const publicRoute = require('./publicRoute');
const placeRoute = require('./placeRoute');
const userRoute = require('./userRoute');
const conversationRoute = require('./conversationRoute');
const notificationRoute = require('./notificationRoute');

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/auth/admin',
        route: adminAuthRoute,
    },
    {
        path: '/admin/role',
        route: roleRoute,
    },
    {
        path: '/admin/hobby',
        route: hobbyRoute,
    },
    {
        path: '/admin/interest',
        route: interestRoute,
    },
    {
        path: '/event',
        route: eventRoute,
    },
    {
        path: '/language',
        route: languageRoute,
    },
    {
        path: '/education',
        route: educationRoute,
    },
    {
        path: '/politic',
        route: politicRoute,
    },
    {
        path: '/religion',
        route: religionRoute,
    },
    {
        path: '/category',
        route: categoryRoute,
    },
    {
        path: '/music',
        route: musicRoute,
    },
    {
        path: '/diet',
        route: dietRoute,
    },
    {
        path: '/industry',
        route: industryRoute,
    },
    {
        path: '/public',
        route: publicRoute,
    },
    {
        path: '/place',
        route: placeRoute,
    },
    {
        path: '/user',
        route: userRoute,
    },
    {
        path: '/conversation',
        route: conversationRoute,
    },
    {
        path: '/notification',
        route: notificationRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
