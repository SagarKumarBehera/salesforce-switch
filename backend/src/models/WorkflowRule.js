const mongoose = require('mongoose');

const WorkflowRuleSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  object_name: { type: String },
  name: { type: String },
  active: { type: Boolean },
  actions: { type: String },
  booleanFilter: { type: String },
  criteriaItems: { type: String },
  description: { type: String },
  formula: { type: String },
  fullName: { type: String },
  triggerType: { type: String },
  workflowTimeTriggers: { type: String }
});

module.exports = mongoose.model('WorkflowRule', WorkflowRuleSchema);
