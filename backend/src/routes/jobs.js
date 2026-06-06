const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const ValidationRule = require('../models/ValidationRule');
const WorkflowRule = require('../models/WorkflowRule');
const ApexTrigger = require('../models/ApexTrigger');
const Flow = require('../models/Flow');
const DeployJob = require('../models/DeployJob');
const DeployJobComponent = require('../models/DeployJobComponent');
const { metadataQueue, deployQueue } = require('../workers/queues');

// @route   POST api/jobs/metadata
// @desc    Create a new job to fetch metadata
router.post('/metadata', async (req, res) => {
  try {
    const { username, org_id, org_name, instance_url, access_token, environment } = req.body;

    const job = new Job({
      random_id: uuidv4(),
      username,
      org_id,
      org_name,
      instance_url,
      access_token,
      is_sandbox: environment === 'Sandbox',
      status: 'Not Started'
    });

    await job.save();

    // Add task to queue
    await metadataQueue.add('fetch-metadata', { jobId: job._id });

    res.status(201).json({
      success: true,
      jobId: job.random_id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET api/jobs/:id
// @desc    Get job status and data
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ random_id: req.params.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.status === 'Finished') {
      const validationRules = await ValidationRule.find({ job: job._id });
      const workflowRules = await WorkflowRule.find({ job: job._id });
      const triggers = await ApexTrigger.find({ job: job._id });
      const flows = await Flow.find({ job: job._id });

      return res.json({
        success: true,
        job,
        data: {
          validationRules,
          workflowRules,
          triggers,
          flows
        }
      });
    }

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST api/jobs/:id/deploy
// @desc    Create a deployment job
router.post('/:id/deploy', async (req, res) => {
  try {
    const { metadata_type, components } = req.body;
    const job = await Job.findOne({ random_id: req.params.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const deployJob = new DeployJob({
      job: job._id,
      metadata_type,
      status: 'Not Started'
    });

    await deployJob.save();

    for (const comp of components) {
      const deployComp = new DeployJobComponent({
        deploy_job: deployJob._id,
        enable: comp.enable,
        metadata_type: metadata_type
      });

      if (metadata_type === 'validation_rule') deployComp.validation_rule = comp.component_id;
      else if (metadata_type === 'workflow_rule') deployComp.workflow_rule = comp.component_id;
      else if (metadata_type === 'trigger') deployComp.trigger = comp.component_id;
      else if (metadata_type === 'flow') deployComp.flow = comp.component_id;

      await deployComp.save();
    }

    // Add task to queue
    await deployQueue.add('deploy-metadata', { deployJobId: deployJob._id });

    res.json({ success: true, deployJobId: deployJob._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
