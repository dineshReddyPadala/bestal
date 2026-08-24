import { z } from 'zod';

export const skillCommunityListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  iconUrl: z.string().nullable(),
  displayOrder: z.number(),
});

export const skillCommunityListResponseSchema = z.object({
  data: z.array(skillCommunityListItemSchema),
});
