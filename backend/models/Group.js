const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupId: { type: Number, required: true },
  verifiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Group', GroupSchema);
