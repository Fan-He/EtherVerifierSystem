const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const openpgp = require('openpgp');
const { ethers } = require('ethers');
const { requestRandomNumber, checkRequestFulfillment, getLatestRandomNumber } = require('../smart-contract/vrfIntegration');
const Group = require('../models/Group');
const RandomRequest = require('../models/RandomRequest');


const TOTAL_SELECTION = 50; // Total number of users to select
const VERIFIER_GROUP_COUNT = 10; // Number of verifiers per group 
const PROVIDER_GROUP_COUNT = 1; // Number of providers per group

exports.register = async (req, res) => {
  try {
    const { username, email, password, identity } = req.body;

    // Check if address is provided
    let walletAddress = req.body.walletAddress || null;
    let walletPrivateKey = null;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
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
      walletPrivateKey, 
      identity
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
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
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

exports.switchIdentity = async (req, res) => {
  try {
    const { email, newIdentity } = req.body;
    // const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Identity User not found' });
    }
    user.identity = newIdentity;
    await user.save();
    
    res.json({ message: `Identity switched to ${newIdentity}` });
    // const { email, identity } = req.body;

    // console.log('User Email:', email);
    // console.log('New Identity:', identity);

    // if (!['provider', 'verifier'].includes(identity)) {
    //   return res.status(400).json({ message: 'Invalid identity type' });
    // }

    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // user.identity = identity;
    // await user.save();

    // res.json({ message: `Identity switched to ${identity}` });
  } catch (error) {
    console.error('Error switching identity:', error); // Add error logging
    res.status(500).json({ error: error.message });
  }
};

exports.getIdentityCounts = async (req, res) => {
  try {
    const providerCount = await User.countDocuments({ identity: 'provider' });
    const verifierCount = await User.countDocuments({ identity: 'verifier' });

    res.json({ providerCount, verifierCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.requestRandomNumber = async (req, res) => {
  console.log("-------request random number from controller--------------");
  try {
    const account = req.body.account;
    const receipt = await requestRandomNumber(account);
    res.json({ txHash: receipt.transactionHash });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.checkRequestFulfillment = async (req, res) => {
  try {
    const requests = await RandomRequest.find({ fulfilled: false });
    console.log('Pending requests:', requests);

    let fulfillmentStatus = requests.length > 0 ? true : false;

    for (const request of requests) {
      const randomNumber = await checkRequestFulfillment(request.requestId);
      console.log('Fulfillment result for request', request.requestId, ':', randomNumber);
      if (!randomNumber) {
        fulfillmentStatus = false;
        break;
      }
    }

    res.json({ message: 'Checked fulfillment status for pending requests', fulfillmentStatus });
  } catch (error) {
    console.error('Error in checkRequestFulfillment:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getLatestRandomNumber = async (req, res) => {
  try {
    const randomNumber = await getLatestRandomNumber();
    res.json({ randomNumber });
  } catch (error) {
    console.error('Error in getLatestRandomNumber:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ identity: 'provider' }).select('walletAddress');
    res.json(providers);
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
};

