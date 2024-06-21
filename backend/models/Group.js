const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  groupId: { type: Number, required: true }
});

module.exports = mongoose.model('Group', GroupSchema);
