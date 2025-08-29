// /apps/client/pages/api/redis-test.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // test SET and GET
    await redis.set('test-key', 'success', 'EX', 60);
    const value = await redis.get('test-key');
    res.status(200).json({ result: value });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
