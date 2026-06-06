const jsforce = require('jsforce');
const Job = require('../models/Job');
const DeployJob = require('../models/DeployJob');
const DeployJobComponent = require('../models/DeployJobComponent');
const ValidationRule = require('../models/ValidationRule');
const WorkflowRule = require('../models/WorkflowRule');
const ApexTrigger = require('../models/ApexTrigger');
const Flow = require('../models/Flow');

const deployMetadata = async (deployJobId) => {
  const deployJob = await DeployJob.findById(deployJobId).populate('job');
  if (!deployJob) throw new Error('Deploy job not found');

  deployJob.status = 'Deploying';
  await deployJob.save();

  const job = deployJob.job;
  const conn = new jsforce.Connection({
    instanceUrl: job.instance_url,
    accessToken: job.access_token,
    version: process.env.SALESFORCE_API_VERSION || '60.0'
  });

  const components = await DeployJobComponent.find({ deploy_job: deployJobId })
    .populate('validation_rule')
    .populate('workflow_rule')
    .populate('trigger')
    .populate('flow');

  try {
    if (deployJob.metadata_type === 'validation_rule' || deployJob.metadata_type === 'workflow_rule') {
      const type = deployJob.metadata_type === 'validation_rule' ? 'ValidationRule' : 'WorkflowRule';
      
      for (let i = 0; i < components.length; i += 10) {
        const chunk = components.slice(i, i + 10);
        const fullNames = chunk.map(c => c[deployJob.metadata_type].fullName);
        
        const metadata = await conn.metadata.read(type, fullNames);
        const metadataArray = Array.isArray(metadata) ? metadata : [metadata];

        for (let j = 0; j < metadataArray.length; j++) {
          metadataArray[j].active = chunk[j].enable;
        }

        const result = await conn.metadata.update(type, metadataArray);
        const results = Array.isArray(result) ? result : [result];

        if (results.some(r => !r.success)) {
          const firstError = results.find(r => !r.success).errors;
          throw new Error(Array.isArray(firstError) ? firstError[0].message : firstError.message);
        }
      }
    } else if (deployJob.metadata_type === 'flow') {
      for (const comp of components) {
        const flowUpdate = {
          Metadata: {
            activeVersionNumber: comp.enable ? comp.flow.latest_version : null
          }
        };
        await conn.tooling.sobject('FlowDefinition').update({
          Id: comp.flow.flow_id,
          ...flowUpdate
        });
      }
    } else if (deployJob.metadata_type === 'trigger') {
      const jszip = require('jszip');
      const zip = new jszip();
      
      const pkgXml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>ApexTrigger</name>
    </types>
    <version>${conn.version}</version>
</Package>`;
      
      zip.file('package.xml', pkgXml);
      
      for (const comp of components) {
        const trigger = comp.trigger;
        zip.file(`triggers/${trigger.name}.trigger`, trigger.content);
        
        let metaContent = trigger.meta_content;
        if (comp.enable) {
          metaContent = metaContent.replace('<status>Inactive</status>', '<status>Active</status>');
        } else {
          metaContent = metaContent.replace('<status>Active</status>', '<status>Inactive</status>');
        }
        zip.file(`triggers/${trigger.name}.trigger-meta.xml`, metaContent);
      }

      const zipBase64 = await zip.generateAsync({ type: 'base64' });
      const deployResult = await conn.metadata.deploy(zipBase64, { rollbackOnError: true }).complete();

      if (!deployResult.success) {
        throw new Error(deployResult.errorMessage || 'Trigger deployment failed');
      }
    }

    deployJob.status = 'Finished';
    await deployJob.save();

  } catch (err) {
    console.error('Deployment Error:', err);
    deployJob.status = 'Error';
    deployJob.error = err.message;
    await deployJob.save();
  }
};

module.exports = { deployMetadata };
