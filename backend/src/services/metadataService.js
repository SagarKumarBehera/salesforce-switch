const jsforce = require('jsforce');
const Job = require('../models/Job');
const ValidationRule = require('../models/ValidationRule');
const WorkflowRule = require('../models/WorkflowRule');
const ApexTrigger = require('../models/ApexTrigger');
const Flow = require('../models/Flow');

const fetchMetadata = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  job.status = 'Downloading Metadata';
  await job.save();

  const conn = new jsforce.Connection({
    instanceUrl: job.instance_url,
    accessToken: job.access_token,
    version: process.env.SALESFORCE_API_VERSION || '60.0'
  });

  try {
    // 1. Fetch Validation Rules and Workflow Rules using Metadata API
    const types = [{ type: 'ValidationRule' }, { type: 'WorkflowRule' }, { type: 'ApexTrigger' }];
    const metadataList = await conn.metadata.list(types, conn.version);

    const valRuleFullNames = metadataList
      .filter(m => m.type === 'ValidationRule')
      .map(m => m.fullName);
    
    const wfRuleFullNames = metadataList
      .filter(m => m.type === 'WorkflowRule')
      .map(m => m.fullName);

    const triggerFullNames = metadataList
      .filter(m => m.type === 'ApexTrigger')
      .map(m => m.fullName);

    // Read details for Validation Rules in chunks of 10
    for (let i = 0; i < valRuleFullNames.length; i += 10) {
      const chunk = valRuleFullNames.slice(i, i + 10);
      const details = await conn.metadata.read('ValidationRule', chunk);
      const results = Array.isArray(details) ? details : [details];

      for (const comp of results) {
        if (!comp) continue;
        await new ValidationRule({
          job: job._id,
          object_name: comp.fullName.split('.')[0],
          name: comp.fullName.split('.')[1],
          fullName: comp.fullName,
          active: comp.active,
          description: comp.description,
          errorConditionFormula: comp.errorConditionFormula,
          errorDisplayField: comp.errorDisplayField,
          errorMessage: comp.errorMessage
        }).save();
      }
    }

    // Read details for Workflow Rules in chunks of 10
    for (let i = 0; i < wfRuleFullNames.length; i += 10) {
      const chunk = wfRuleFullNames.slice(i, i + 10);
      const details = await conn.metadata.read('WorkflowRule', chunk);
      const results = Array.isArray(details) ? details : [details];

      for (const comp of results) {
        if (!comp) continue;
        let actions = '';
        if (comp.actions) {
          const acts = Array.isArray(comp.actions) ? comp.actions : [comp.actions];
          actions = acts.map(a => `- ${a.type}: ${a.name}`).join('\n');
        }

        let criteriaItems = '';
        if (comp.criteriaItems) {
          const items = Array.isArray(comp.criteriaItems) ? comp.criteriaItems : [comp.criteriaItems];
          criteriaItems = items.map(item => `- ${item.field} ${item.operation} ${item.value || item.valueField || ''}`).join('\n');
        }

        await new WorkflowRule({
          job: job._id,
          object_name: comp.fullName.split('.')[0],
          name: comp.fullName.split('.')[1],
          fullName: comp.fullName,
          active: comp.active,
          actions,
          criteriaItems,
          description: comp.description,
          formula: comp.formula,
          triggerType: comp.triggerType
        }).save();
      }
    }

    // 2. Fetch Flows using Tooling API
    const flowsResult = await conn.tooling.query('SELECT Id, ActiveVersion.VersionNumber, LatestVersion.VersionNumber, DeveloperName FROM FlowDefinition');
    if (flowsResult.records) {
      for (const record of flowsResult.records) {
        await new Flow({
          job: job._id,
          flow_id: record.Id,
          name: record.DeveloperName,
          active: !!record.ActiveVersion,
          latest_version: record.LatestVersion ? record.LatestVersion.VersionNumber : 1,
          active_version: record.ActiveVersion ? record.ActiveVersion.VersionNumber : null
        }).save();
      }
    }

    // 3. Fetch Apex Triggers using Metadata API (Retrieve for content)
    if (triggerFullNames.length > 0) {
      const retrieveResult = await conn.metadata.retrieve({
        unpackaged: {
          types: [{ name: 'ApexTrigger', members: triggerFullNames }],
          version: conn.version
        }
      }).complete();

      if (retrieveResult.zipFile) {
        const zip = require('jszip');
        const content = await zip.loadAsync(Buffer.from(retrieveResult.zipFile, 'base64'));
        
        for (const fullName of triggerFullNames) {
          const triggerFile = content.file(`unpackaged/triggers/${fullName}.trigger`);
          const metaFile = content.file(`unpackaged/triggers/${fullName}.trigger-meta.xml`);

          if (triggerFile) {
            const triggerContent = await triggerFile.async('string');
            const metaContent = metaFile ? await metaFile.async('string') : '';
            
            let active = false;
            if (metaContent) {
              const activeMatch = metaContent.match(/<status>(.*)<\/status>/);
              active = activeMatch && activeMatch[1] === 'Active';
            }

            await new ApexTrigger({
              job: job._id,
              name: fullName,
              content: triggerContent,
              meta_content: metaContent,
              active: active
            }).save();
          }
        }
      }
    }

    job.status = 'Finished';
    job.finished_date = new Date();
    await job.save();

  } catch (err) {
    console.error('Metadata Fetch Error:', err);
    job.status = 'Error';
    job.error = err.message;
    job.finished_date = new Date();
    await job.save();
  }
};

module.exports = { fetchMetadata };
