const mongoose = require('mongoose');

const RandomRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  randomNumber: { type: String }, // Store as string to handle BigInt
  fulfilled: { type: Boolean, default: false },
  used: { type: Boolean, default: false }, // indicate if the number has been used
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RandomRequest', RandomRequestSchema);
