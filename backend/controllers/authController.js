const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const openpgp = require('openpgp');
const { ethers } = require('ethers');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if address is provided
    let walletAddress = req.body.walletAddress || null;
    let walletPrivateKey = null;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate public and private keys
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 2048,
      userIDs: [{ name: username, email }], 
      passphrase: password
    });

    // Create a wallet if not provided
    if (!walletAddress) {
      const wallet = ethers.Wallet.createRandom();
      walletAddress = wallet.address;
      walletPrivateKey = wallet.privateKey;
    }

    const user = new User({
      username,
      email,
      password: hashedPassword,
      publicKey,
      privateKey,
      walletAddress,
      walletPrivateKey
    });

    await user.save();
    res.status(201).json({ message: 'User has registered successfully', walletAddress, walletPrivateKey });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    console.log('input password: ', req.body.password)
    const token = jwt.sign({ id: user._id, tempPassword: req.body.password }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserProfileByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('username email publicKey');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
