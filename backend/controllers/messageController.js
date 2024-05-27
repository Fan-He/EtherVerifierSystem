const User = require('../models/User');
const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;
    const sender = req.user.id;
    const recipient = await User.findOne({ email: to });

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const message = new Message({
      from: sender,
      to: recipient._id,
      content: content,
      timestamp: new Date()
    });

    await message.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({ to: userId }).populate('from', 'username');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
