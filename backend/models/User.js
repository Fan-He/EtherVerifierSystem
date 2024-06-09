const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  publicKey: { type: String },
  privateKey: { type: String },
  walletAddress: { type: String, unique: true },
  walletPrivateKey: { type: String },
  identity: { type: String, enum: ['provider', 'verifier'], required: true, default: 'verifier' }
});

module.exports = mongoose.model('User', UserSchema);
