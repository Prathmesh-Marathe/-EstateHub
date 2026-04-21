const { Conversation, Message } = require('../models/Chat');
const Property = require('../models/Property');

// @desc    Start or get existing conversation for a property
// @route   POST /api/chat/conversation
// @access  Private (buyer)
const getOrCreateConversation = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Owner cannot start a conversation with themselves
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You own this property' });
    }

    // Find or create
    let conversation = await Conversation.findOne({
      property: propertyId,
      buyer: req.user._id
    })
      .populate('property', 'title images location')
      .populate('buyer', 'name email avatar')
      .populate('owner', 'name email avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        buyer: req.user._id,
        owner: property.owner
      });
      conversation = await conversation
        .populate('property', 'title images location');
      conversation = await conversation
        .populate('buyer', 'name email avatar');
      conversation = await conversation
        .populate('owner', 'name email avatar');
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all conversations for the current user (as owner OR buyer)
// @route   GET /api/chat/conversations
// @access  Private
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ buyer: req.user._id }, { owner: req.user._id }]
    })
      .populate('property', 'title images location status')
      .populate('buyer', 'name email avatar')
      .populate('owner', 'name email avatar')
      .sort('-lastMessageAt');

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Only participants can read messages
    const isParticipant =
      conversation.buyer.toString() === req.user._id.toString() ||
      conversation.owner.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    // Mark messages as read
    const isOwner = conversation.owner.toString() === req.user._id.toString();
    if (isOwner && conversation.unreadByOwner > 0) {
      await Conversation.findByIdAndUpdate(req.params.id, { unreadByOwner: 0 });
    } else if (!isOwner && conversation.unreadByBuyer > 0) {
      await Conversation.findByIdAndUpdate(req.params.id, { unreadByBuyer: 0 });
    }

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Save a message (also called from socket handler)
const saveMessage = async ({ conversationId, senderId, text }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error('Conversation not found');

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text,
    readBy: [senderId]
  });

  const isOwner = conversation.owner.toString() === senderId.toString();

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    lastMessageAt: new Date(),
    $inc: {
      unreadByOwner: isOwner ? 0 : 1,
      unreadByBuyer: isOwner ? 1 : 0
    }
  });

  const populated = await message.populate('sender', 'name avatar');
  return populated;
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  saveMessage
};
