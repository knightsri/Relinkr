import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user?.email || session.user?.id || 'unknown';
  const { internalId } = req.body;
  console.log('BODY', req.body); // DEBUG

  if (!internalId || typeof internalId !== 'string')
    return res.status(400).json({ error: 'Invalid internal id' });

  // 1. Find user's slug for this internalId
  const slugs = await redis.smembers(`user:${userId}:links`);
  let matchSlug = null, entry = null;
  for (const slug of slugs) {
    const candidate = await redis.get(`url:${slug}`);
    if (candidate) {
      const data = JSON.parse(candidate);
      if (data.internalId === internalId && data.ownerId === userId) {
        matchSlug = slug;
        entry = data;
        break;
      }
    }
  }
  if (!matchSlug) return res.status(404).json({ error: 'Link not found' });

  // Remove from both
  await redis.multi()
    .del(`url:${matchSlug}`)
    .srem(`user:${userId}:links`, matchSlug)
    .exec();

  res.status(200).json({ deleted: true });
}
// Note: This API endpoint deletes a user's short link by its internal ID.