// /pages/[slug].tsx

import { GetServerSideProps } from "next";
import { redis } from "../lib/redis";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params || {};

  if (!slug || typeof slug !== "string") return { notFound: true };

  // const entry = await redis.get(`url:${slug}`);
  const entry = await redis.get(`url:${slug.toLowerCase()}`);
  if (!entry) return { notFound: true };

  const data = JSON.parse(entry);

  // --- Log analytic event ---
  // Basic click count
  await redis.incr(`clicks:${slug.toLowerCase()}`);

  // Optional: log full event as a List for later batch analytics/reporting
  await redis.lpush(
    `logs:${slug.toLowerCase()}`,
    JSON.stringify({
      timestamp: Date.now(),
      ip: context.req?.headers["x-forwarded-for"] || context.req?.socket?.remoteAddress || 'unknown',
      referrer: context.req?.headers["referer"] || '',
      userAgent: context.req?.headers["user-agent"] || '',
    })
  );
  // --- End log ---

  return {
    redirect: {
      destination: data.longUrl,
      permanent: false,
    },
  };
};

export default function RedirectPage() {
  return null;
}
// Note: This page handles the redirection of short links to their original URLs.
