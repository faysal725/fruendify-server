const express = require("express");
const ConversationController = require("../controllers/User/Conversation/ConversationController");
const ConversationValidator = require("../validator/ConversationValidator");

const router = express.Router();
const auth = require("../middlewares/auth");

const conversationController = new ConversationController();
const conversationValidator = new ConversationValidator();

router.post(
  "/send-sms",
  auth(),
  conversationValidator.conversationCreateValidator,
  conversationController.createConversation
);
router.get("/list/:eventUid", auth(), conversationController.getConversations);
// router.get('/details/:conversationUid', auth(), conversationController.getSpecificData);
router.post(
  "/update",
  auth(),
  conversationValidator.conversationUpdateValidator,
  conversationController.updateConversation
);
router.delete(
  "/delete-sms/:conversationUid",
  auth(),
  conversationValidator.conversationUidValidator,
  conversationController.deleteConversation
);

module.exports = router;
