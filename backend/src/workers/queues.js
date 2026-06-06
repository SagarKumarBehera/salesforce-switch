const { Queue } = require("bullmq");
const IORedis = require("ioredis");

let connection = null;
let metadataQueue = null;
let deployQueue = null;

const redisUrl = process.env.REDIS_URL;

async function initQueues() {
  if (!redisUrl) {
    console.warn("REDIS_URL not provided. Background tasks will be disabled.");
    setupMockQueues();
    return;
  }

  try {
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      connectTimeout: 500,
    });

    connection.on("error", (err) => {
      // Silence further errors
    });

    await connection.connect().catch((err) => {
      throw new Error("Redis connection failed");
    });

    console.log("Connected to Redis");
    metadataQueue = new Queue("metadata-queue", { connection });
    deployQueue = new Queue("deploy-queue", { connection });
  } catch (err) {
    console.warn("Redis connection failed. Background tasks will be disabled.");
    setupMockQueues();
    connection = null;
  }
}

function setupMockQueues() {
  metadataQueue = {
    add: () => {
      console.warn("Queue is disabled (Redis missing)");
      return Promise.resolve({ id: "mock" });
    },
  };
  deployQueue = {
    add: () => {
      console.warn("Queue is disabled (Redis missing)");
      return Promise.resolve({ id: "mock" });
    },
  };
}

// Initializing queues immediately
initQueues();

module.exports = {
  get metadataQueue() {
    return metadataQueue || { add: () => Promise.resolve({ id: "mock" }) };
  },
  get deployQueue() {
    return deployQueue || { add: () => Promise.resolve({ id: "mock" }) };
  },
  get connection() {
    return connection;
  },
};
