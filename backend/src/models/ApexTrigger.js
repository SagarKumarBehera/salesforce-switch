const mongoose = require('mongoose');

const ApexTriggerSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  active: { type: Boolean, default: false },
  content: { type: String },
  meta_content: { type: String },
  name: { type: String }
});

module.exports = mongoose.model('ApexTrigger', ApexTriggerSchema);
