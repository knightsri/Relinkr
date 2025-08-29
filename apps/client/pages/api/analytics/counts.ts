import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user?.email || 'unknown';
  const { slugs } = req.query;

  if (!slugs) {
    return res.status(400).json({ error: 'Slugs parameter required' });
  }

  const slugArray = Array.isArray(slugs) ? slugs : [slugs];

  // Fetch click counts for the provided slugs
  const pipeline = redis.pipeline();
  slugArray.forEach(slug => {
    pipeline.get(`clicks:${slug.toLowerCase()}`);
  });
  
  const results = await pipeline.exec();
  
  const clickCounts: Record<string, number> = {};
  if (results) {
    slugArray.forEach((slug, index) => {
      const [err, count] = results[index];
      clickCounts[slug] = (!err && count) ? parseInt(count as string, 10) : 0;
    });
  }

  res.status(200).json({ clickCounts });
}
