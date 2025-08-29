import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Slug length config from env
const SLUG_LENGTH = (() => {
  const tryLen = parseInt(process.env.SLUG_LENGTH || '', 10);
  if (!tryLen || tryLen < 4) return 4; // default/failsafe
  if (tryLen > 25) return 25;          // upper bound
  return tryLen;
})();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { longUrl, customSlug } = req.body;

  if (!longUrl || typeof longUrl !== 'string' || !longUrl.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid long URL. Must start with https://' });
  }

  // Handle customSlug or auto-generated
  let slug;
  if (customSlug) {
    if (typeof customSlug !== 'string') {
      return res.status(400).json({ error: 'Invalid custom slug' });
    }
    if (
      customSlug.length < 4 ||
      customSlug.length > 25
    ) {
      return res.status(400).json({
        error: `Custom slug must be 4 - 25 chars`
      });
    }
    slug = customSlug.toLowerCase();
  } else {
    slug = nanoid(SLUG_LENGTH);
  }

  // Check for slug collision
  const exists = await redis.get(`url:${slug}`);
  if (exists) return res.status(409).json({ error: 'Slug already exists' });

  const internalId = nanoid(12);
  const ownerId = session.user?.email || 'unknown';

  // Save mapping
  await redis.set(
    `url:${slug}`,
    JSON.stringify({ longUrl, ownerId, internalId })
  );
  // Track links by user
  await redis.sadd(`user:${ownerId}:links`, slug);

  res.status(201).json({
    slug, longUrl, internalId, ownerId
  });
}
