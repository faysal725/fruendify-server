const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');
const NotificationController = require('../controllers/User/Notification/NotificationController');

const notificationController = new NotificationController();

router.get('/list', auth(), notificationController.getNotificationList);
router.get('/unread/list', auth(), notificationController.getUnreadNotificationList);
router.post(
    '/status/update/:notificationUid',
    auth(),
    notificationController.updateNotificationStatus,
);

module.exports = router;
