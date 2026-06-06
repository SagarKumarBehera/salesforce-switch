const mongoose = require('mongoose');

const ValidationRuleSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  object_name: { type: String },
  name: { type: String },
  active: { type: Boolean },
  description: { type: String },
  errorConditionFormula: { type: String },
  errorDisplayField: { type: String },
  errorMessage: { type: String },
  fullName: { type: String }
});

module.exports = mongoose.model('ValidationRule', ValidationRuleSchema);
