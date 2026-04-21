const express = require('express');
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All chat routes require auth

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getMyConversations);
router.get('/conversations/:id/messages', getMessages);

module.exports = router;
