import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { ZodError, z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user?.email || 'unknown';

  // Validate input using Zod
  const deleteRequestSchema = z.object({
    internalId: z.string().min(1, 'Internal ID is required'),
  });

  let validatedData;
  try {
    validatedData = deleteRequestSchema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }

  const { internalId } = validatedData;

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
