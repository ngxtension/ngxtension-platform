import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'ngxtension',
			logo: {
				src: './public/logo.svg',
				alt: 'ngxtension logo',
			},
			favicon: './logo.svg',
			social: {
				github: 'https://github.com/nartc/ngxtension-platform',
				twitter: 'https://twitter.com/Nartc1410',
			},
			lastUpdated: true,
			sidebar: [
				{
					label: 'Getting Started',
					autogenerate: { directory: 'getting-started' },
				},
				{
					label: 'Utilities',
					autogenerate: { directory: 'utilities' },
				},
			],
		}),
	],
});
