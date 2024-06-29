const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupId: { type: Number, required: true },
  verifiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  randomNumber: { type: String, required: true },
});

module.exports = mongoose.model('Group', GroupSchema);
