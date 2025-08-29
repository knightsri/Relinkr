import { z } from 'zod';

// Schema for creating a new link
export const createLinkSchema = z.object({
  longUrl: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine((url) => url.startsWith('https://'), {
      message: 'URL must start with https://',
    }),
  customSlug: z
    .string()
    .min(4, 'Custom slug must be at least 4 characters')
    .max(25, 'Custom slug must be at most 25 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Custom slug can only contain letters, numbers, hyphens, and underscores')
    .optional(),
});

// Schema for updating a link
export const updateLinkSchema = z.object({
  longUrl: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine((url) => url.startsWith('https://'), {
      message: 'URL must start with https://',
    })
    .optional(),
  customSlug: z
    .string()
    .min(4, 'Custom slug must be at least 4 characters')
    .max(25, 'Custom slug must be at most 25 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Custom slug can only contain letters, numbers, hyphens, and underscores')
    .optional(),
});

// Schema for slug parameter validation
export const slugSchema = z
  .string()
  .min(4, 'Slug must be at least 4 characters')
  .max(25, 'Slug must be at most 25 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid slug format');

// Schema for search/list parameters
export const listLinksSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Type exports for TypeScript
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type ListLinksInput = z.infer<typeof listLinksSchema>;
