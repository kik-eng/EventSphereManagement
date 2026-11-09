const mongoose = require('mongoose');
const User = require('../model/userSchema');
const Message = require('../model/messageSchema');

const isId = (id) => mongoose.isValidObjectId(id);

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.id;

    if (!isId(receiverId)) return res.status(400).json({ message: 'Valid receiverId is required.' });
    if (String(receiverId) === String(senderId)) {
      return res.status(400).json({ message: 'You cannot message yourself.' });
    }

    const clean = String(text || '').trim();
    if (!clean) return res.status(400).json({ message: 'Message cannot be empty.' });
    if (clean.length > 1000) return res.status(400).json({ message: 'Message is too long (max 1000 chars).' });

    const receiver = await User.findById(receiverId).select('_id');
    if (!receiver) return res.status(404).json({ message: 'Recipient not found.' });

    const chat = await Message.create({ sender: senderId, receiver: receiverId, text: clean });
    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message.', error: error.message });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const me = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: me }, { receiver: me }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$sender', me] }, '$receiver', '$sender'] },
          lastMessage: { $first: '$text' },
          lastAt: { $first: '$createdAt' },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', me] }, { $eq: ['$read', false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          lastMessage: 1,
          lastAt: 1,
          unread: 1,
          'user._id': 1,
          'user.name': 1,
          'user.role': 1,
          'user.companyDetails.companyName': 1,
          'user.companyDetails.logoUrl': 1,
        },
      },
    ]);

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inbox.', error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user.id;
    if (!isId(userId)) return res.status(400).json({ message: 'Invalid user id.' });

    await Message.updateMany({ sender: userId, receiver: me, read: false }, { read: true });

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation.', error: error.message });
  }
};

exports.getSupportAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('_id name');
    if (!admin) return res.status(404).json({ message: 'No admin account available.' });
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch support contact.', error: error.message });
  }
};