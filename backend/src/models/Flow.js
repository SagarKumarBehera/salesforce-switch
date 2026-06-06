const mongoose = require('mongoose');

const FlowSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  flow_id: { type: String },
  active: { type: Boolean, default: false },
  name: { type: String },
  latest_version: { type: Number },
  active_version: { type: Number }
});

module.exports = mongoose.model('Flow', FlowSchema);
