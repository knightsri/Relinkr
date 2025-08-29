import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user?.email || session.user?.id || 'unknown';
  const { internalId, longUrl } = req.body;

  console.log('BODY', req.body); // DEBUG LINE

  if (!internalId || typeof internalId !== 'string')
    return res.status(400).json({ error: 'Invalid internal id' });

  if (!longUrl || typeof longUrl !== 'string' || !longUrl.startsWith('https://'))
    return res.status(400).json({ error: 'Invalid long URL. Must start with https://' });

  // 1. Scan user's slugs to find match by internalId
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

  entry.longUrl = longUrl;
  await redis.set(`url:${matchSlug}`, JSON.stringify(entry));
  res.status(200).json({ updated: true });
}
// Note: This endpoint allows updating the longUrl of an existing link identified by its internalId.