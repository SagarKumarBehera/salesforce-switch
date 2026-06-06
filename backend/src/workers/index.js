const { Worker } = require('bullmq');
const { connection } = require('./queues');
const { fetchMetadata } = require('../services/metadataService');
const { deployMetadata } = require('../services/deployService');

if (connection) {
  try {
    const metadataWorker = new Worker('metadata-queue', async (job) => {
      console.log(`Processing metadata fetch for job: ${job.data.jobId}`);
      await fetchMetadata(job.data.jobId);
    }, { connection });

    const deployWorker = new Worker('deploy-queue', async (job) => {
      console.log(`Processing deployment for job: ${job.data.deployJobId}`);
      await deployMetadata(job.data.deployJobId);
    }, { connection });

    metadataWorker.on('completed', (job) => {
      console.log(`Metadata fetch completed for job: ${job.data.jobId}`);
    });

    metadataWorker.on('failed', (job, err) => {
      console.error(`Metadata fetch failed for job: ${job.data.jobId}`, err);
    });

    deployWorker.on('completed', (job) => {
      console.log(`Deployment completed for job: ${job.data.deployJobId}`);
    });

    deployWorker.on('failed', (job, err) => {
      console.error(`Deployment failed for job: ${job.data.deployJobId}`, err);
    });

    console.log('Workers started');
  } catch (err) {
    console.warn('Failed to start workers:', err.message);
  }
} else {
  console.warn('No Redis connection, workers not started.');
}
