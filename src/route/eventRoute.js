const express = require('express');
const EventController = require('../controllers/User/Event/EventController');
const EventValidator = require('../validator/EventValidator');

const router = express.Router();
const auth = require('../middlewares/auth');

const eventController = new EventController();
const eventValidator = new EventValidator();

router.post('/create', auth(), eventValidator.eventCreateValidator, eventController.createEvent);
router.get('/list', auth(), eventController.getEvents);
router.get('/details/:eventUid', auth(), eventController.getSpecificData);
router.post('/update', auth(), eventValidator.eventUpdateValidator, eventController.updateEvent);
router.delete(
    '/delete/:eventUid',
    auth(),
    eventValidator.eventUidValidator,
    eventController.deleteEvent,
);

router.post(
    '/join/:eventUid',
    auth(),
    eventValidator.eventUidValidator,
    eventController.eventJoinRequest,
);
router.get(
    '/participant/:eventUid',
    auth(),
    eventValidator.eventUidValidator,
    eventController.getEventParticipentData,
);
router.get(
    '/participant-request/:eventUid',
    auth(),
    eventValidator.eventUidValidator,
    eventController.getEventParticipentRequest,
);

router.post(
    '/participant/update/:participantId',
    auth(),
    eventValidator.eventParticipentValidator,
    eventController.eventParticipentStatusUpdate,
);
router.delete('/participant/delete/:participantId', auth(), eventController.eventParticipentDelete);
router.get('/my-events', auth(), eventController.getMyEvent);
router.post('/discover-events', auth(), eventController.getDiscoverEvent);
router.post('/single/discover-events', auth(), eventController.getSingleDiscoverEvent);
router.get('/joined-events', auth(), eventController.getJoinedEvent);
router.get('/events-groups', auth(), eventController.getEventGroup);
router.get('/upcoming-events', auth(), eventController.getUpComingEvent);
router.post(
    '/groups/leave',
    auth(),
    eventValidator.eventParticipentGroupUpdateValidator,
    eventController.eventParticipentGroupStatusUpdate,
);

router.post(
    '/participants/block',
    auth(),
    eventValidator.eventGroupUpdateValidator,
    eventController.eventGroupStatusUpdate,
);

module.exports = router;
