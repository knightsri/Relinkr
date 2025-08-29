import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { updateLinkSchema } from '../../../lib/validation';
import { ZodError } from 'zod';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user?.email || 'unknown';

  // Validate input using Zod
  const updateRequestSchema = z.object({
    internalId: z.string().min(1, 'Internal ID is required'),
    longUrl: z
      .string()
      .min(1, 'URL is required')
      .url('Must be a valid URL')
      .refine((url) => url.startsWith('https://'), {
        message: 'URL must start with https://',
      }),
  });

  let validatedData;
  try {
    validatedData = updateRequestSchema.parse(req.body);
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

  const { internalId, longUrl } = validatedData;

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
