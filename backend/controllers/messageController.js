const User = require('../models/User');
const Message = require('../models/Message');
const openpgp = require('openpgp');

exports.sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;
    const sender = req.user.id;
    const recipient = await User.findOne({ email: to });

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    console.log('Recipient:', recipient);

    let publicKeyResult;
    try {
      publicKeyResult = await openpgp.readKey({ armoredKey: recipient.publicKey });
      console.log('PublicKeyResult:', publicKeyResult); // Log the result of readKey
    } catch (err) {
      console.error('Error reading public key:', err);
      return res.status(400).json({ message: 'Error reading public key', error: err.message });
    }

    const publicKey = publicKeyResult.keys ? publicKeyResult.keys[0] : publicKeyResult;
    if (!publicKey) {
      console.error('Invalid public key:', publicKeyResult);
      return res.status(400).json({ message: 'Invalid public key' });
    }

    console.log('PublicKey for Encryption:', publicKey); // Log the specific key used for encryption

    let encryptedMessage;
    try {
      encryptedMessage = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: content }),
        encryptionKeys: publicKey
      });
      console.log('Encrypted message:', encryptedMessage); // Log the encrypted message
    } catch (err) {
      console.error('Error encrypting message:', err);
      return res.status(400).json({ message: 'Error encrypting message', error: err.message });
    }

    const message = new Message({
      from: sender,
      to: recipient._id,
      content: encryptedMessage,
      timestamp: new Date()
    });

    await message.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error in sendMessage:', error); // Log the error for debugging
    res.status(400).json({ error: error.message });
  }
};

exports.clearMessages = async (req, res) => {
  try {
    await Message.deleteMany({});
    res.status(200).json({ message: 'All messages cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
