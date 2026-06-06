const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  random_id: { type: String, required: true, unique: true, index: true },
  created_date: { type: Date, default: Date.now },
  finished_date: { type: Date },
  org_id: { type: String, required: true },
  org_name: { type: String },
  username: { type: String },
  access_token: { type: String },
  instance_url: { type: String },
  json_message: { type: mongoose.Schema.Types.Mixed },
  is_sandbox: { type: Boolean, default: false },
  status: { type: String, default: "Not Started" },
  error: { type: String },
});

module.exports = mongoose.model("Job", JobSchema);
