const mongoose = require('mongoose');

const DeployJobComponentSchema = new mongoose.Schema({
  deploy_job: { type: mongoose.Schema.Types.ObjectId, ref: 'DeployJob', required: true },
  validation_rule: { type: mongoose.Schema.Types.ObjectId, ref: 'ValidationRule' },
  workflow_rule: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowRule' },
  flow: { type: mongoose.Schema.Types.ObjectId, ref: 'Flow' },
  trigger: { type: mongoose.Schema.Types.ObjectId, ref: 'ApexTrigger' },
  enable: { type: Boolean, required: true },
  status: { type: String },
  error: { type: String }
});

module.exports = mongoose.model('DeployJobComponent', DeployJobComponentSchema);
