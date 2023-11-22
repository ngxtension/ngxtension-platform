import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { defineCollection, z } from 'astro:content';

export const collections = {
	docs: defineCollection({
		schema: (ctx) =>
			docsSchema()(ctx).extend({
				badge: z.enum(['stable', 'unstable', 'experimental']).optional(),
				contributor: z.string().optional(),
			}),
	}),
	i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
};
