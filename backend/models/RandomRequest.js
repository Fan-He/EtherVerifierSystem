// backend/models/RandomRequest.js
const mongoose = require('mongoose');

const RandomRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  randomNumber: { type: Number },
  fulfilled: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RandomRequest', RandomRequestSchema);
