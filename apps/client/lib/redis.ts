// /apps/client/lib/redis.ts

import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Main Redis instance for queries/commands
export const redis = new Redis(redisUrl);

// Separate instance for pub/sub (optional, recommended for future features)
export const redisSubscriber = new Redis(redisUrl);

// Default export for main client (optional, for legacy import style)
export default redis;
