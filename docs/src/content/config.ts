import { docsSchema } from '@astrojs/starlight/schema';
import { defineCollection, reference, z } from 'astro:content';

const contributors = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
		twitter: z.string().url().optional(),
		linkedin: z.string().url().optional(),
		github: z.string().url().optional(),
	}),
});

const docs = defineCollection({
	schema: (ctx) =>
		docsSchema()(ctx).extend({
			badge: z.enum(['stable', 'unstable', 'experimental']).optional(),
			entryPoint: z.string().optional(),
			contributor: reference('contributors').optional(),
		}),
});

export const collections = { docs, contributors };
