const mongoose = require('mongoose');

const DeployJobSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  metadata_type: { type: String },
  deploy_result: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'Not Started' },
  error: { type: String }
});

module.exports = mongoose.model('DeployJob', DeployJobSchema);
