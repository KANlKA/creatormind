import { Queue } from "bullmq";
import Redis from "ioredis";

// Lazy Redis connection - only created when first accessed (not during build)
let _connection: Redis | null = null;
let _weeklyInsightsQueue: Queue | null = null;
let _emailQueue: Queue | null = null;
let _syncQueue: Queue | null = null;

function getConnection(): Redis {
  if (!_connection) {
    _connection = new Redis(process.env.UPSTASH_REDIS_URL || "", {
      maxRetriesPerRequest: null,
    });
  }
  return _connection;
}

// Export queue getter functions
export function getWeeklyInsightsQueue(): Queue {
  if (!_weeklyInsightsQueue) {
    _weeklyInsightsQueue = new Queue("weekly-insights", { connection: getConnection() });
  }
  return _weeklyInsightsQueue;
}

export function getEmailQueue(): Queue {
  if (!_emailQueue) {
    _emailQueue = new Queue("email", { connection: getConnection() });
  }
  return _emailQueue;
}

export function getSyncQueue(): Queue {
  if (!_syncQueue) {
    _syncQueue = new Queue("sync", { connection: getConnection() });
  }
  return _syncQueue;
}


// Helper functions
export async function addWeeklyInsightsJob(userId: string, cronPattern: string, timezone: string) {
  return await getWeeklyInsightsQueue().add(
    `weekly-insights-${userId}`,
    { userId },
    {
      repeat: {
        pattern: cronPattern,
        tz: timezone,
      },
    }
  );
}

export async function addEmailJob(userId: string, ideaId?: string) {
  return await getEmailQueue().add("send-weekly-email", {
    userId,
    ideaId,
  });
}

export async function addSyncJob(userId: string, channelId: string, accessToken: string) {
  return await getSyncQueue().add("sync-channel", {
    userId,
    channelId,
    accessToken,
  });
}
