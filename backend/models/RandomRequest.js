// backend/models/RandomRequest.js
const mongoose = require('mongoose');

const RandomRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  randomNumber: { type: String }, // Store as string to handle BigInt
  fulfilled: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RandomRequest', RandomRequestSchema);
