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
      sortField: req.query.sortField,
      sortDirection: req.query.sortDirection,
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

  const { search: q, page, limit: perPage, sortField, sortDirection } = validatedQuery;
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

  // Apply sorting if specified
  if (sortField && sortDirection) {
    // If sorting by clicks, we need to fetch click counts first
    if (sortField === 'clicks') {
      const clickCountPipeline = redis.pipeline();
      links.forEach(link => clickCountPipeline.get(`analytics:${link.slug}:clicks`));
      const clickResults = await clickCountPipeline.exec();
      
      const clickCounts: Record<string, number> = {};
      if (clickResults) {
        clickResults.forEach(([err, count], i) => {
          if (!err && count) {
            clickCounts[links[i].slug] = parseInt(count as string, 10) || 0;
          } else {
            clickCounts[links[i].slug] = 0;
          }
        });
      }

      // Sort by clicks
      links = links.sort((a, b) => {
        const clicksA = clickCounts[a.slug] || 0;
        const clicksB = clickCounts[b.slug] || 0;
        return sortDirection === 'asc' ? clicksA - clicksB : clicksB - clicksA;
      });
    } else {
      // Sort by slug or longUrl
      links = links.sort((a, b) => {
        let valueA: string;
        let valueB: string;

        if (sortField === 'slug') {
          valueA = a.slug.toLowerCase();
          valueB = b.slug.toLowerCase();
        } else { // longUrl
          valueA = a.longUrl.toLowerCase();
          valueB = b.longUrl.toLowerCase();
        }

        if (sortDirection === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
    }
  } else {
    // Default sorting: newest first using Redis key creation order as proxy for timestamp
    const slugOrder = new Map(slugs.map((slug, index) => [slug, index]));
    links = links.sort((a, b) => {
      const orderA = slugOrder.get(a.slug) ?? 0;
      const orderB = slugOrder.get(b.slug) ?? 0;
      // Reverse order to get newest first (assuming newer slugs are added later to the set)
      return orderB - orderA;
    });
  }

  const total = links.length;
  const paged = links.slice((page - 1) * perPage, page * perPage);

  res.status(200).json({ links: paged, total });
}
// This API endpoint lists the links for the authenticated user, with optional search and pagination.
