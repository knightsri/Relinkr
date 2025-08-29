import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

type LinkEntry = {
  slug: string;
  longUrl: string;
  internalId: string;
  ownerId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user?.email || session.user?.id || 'unknown';
  const q = (req.query.q as string | undefined)?.toLowerCase();
  const page = parseInt((req.query.page as string) || '1', 10);
  const perPage = parseInt((req.query.perPage as string) || '10', 10);

  const slugs = await redis.smembers(`user:${userId}:links`);
  if (!slugs.length) return res.status(200).json({ links: [], total: 0 });

  // Fetch and filter matches
  const pipeline = redis.pipeline();
  slugs.forEach(slug => pipeline.get(`url:${slug}`));
  const results = await pipeline.exec();

  let links: LinkEntry[] = [];
  results.forEach(([err, json], i) => {
    if (!err && json) {
      const info = JSON.parse(json);
      if (!q || slugs[i].includes(q) || info.longUrl?.toLowerCase()?.includes(q)) {
        links.push({ slug: slugs[i], ...info });
      }
    }
  });

  // Sort (optional: newest on top by slug or time, if you store it)
  links = links.sort((a, b) => b.slug.localeCompare(a.slug)); // replace as desired

  const total = links.length;
  const paged = links.slice((page - 1) * perPage, page * perPage);

  res.status(200).json({ links: paged, total });
}
// This API endpoint lists the links for the authenticated user, with optional search and pagination.