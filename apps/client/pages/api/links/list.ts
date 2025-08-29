import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { listLinksSchema } from '../../../lib/validation';
import { ZodError } from 'zod';

type LinkEntry = {
  slug: string;
  longUrl: string;
  internalId: string;
  ownerId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user?.email || 'unknown';

  // Validate query parameters using Zod
  let validatedQuery;
  try {
    validatedQuery = listLinksSchema.parse({
      search: req.query.q,
      page: req.query.page,
      limit: req.query.perPage,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }

  const { search: q, page, limit: perPage } = validatedQuery;
  const searchTerm = q?.toLowerCase();

  const slugs = await redis.smembers(`user:${userId}:links`);
  if (!slugs.length) return res.status(200).json({ links: [], total: 0 });

  // Fetch and filter matches
  const pipeline = redis.pipeline();
  slugs.forEach(slug => pipeline.get(`url:${slug}`));
  const results = await pipeline.exec();

  let links: LinkEntry[] = [];
  if (results) {
    results.forEach(([err, json], i) => {
      if (!err && json && typeof json === 'string') {
        const info = JSON.parse(json);
        if (!searchTerm || slugs[i].includes(searchTerm) || info.longUrl?.toLowerCase()?.includes(searchTerm)) {
          links.push({ slug: slugs[i], ...info });
        }
      }
    });
  }

  // Sort (optional: newest on top by slug or time, if you store it)
  links = links.sort((a, b) => b.slug.localeCompare(a.slug)); // replace as desired

  const total = links.length;
  const paged = links.slice((page - 1) * perPage, page * perPage);

  res.status(200).json({ links: paged, total });
}
// This API endpoint lists the links for the authenticated user, with optional search and pagination.
