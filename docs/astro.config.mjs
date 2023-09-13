import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'ngxtension',
			social: {
				github: 'https://github.com/nartc/ngxtension-platform',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Introduction', link: '/getting-started/introduction' },
						{ label: 'Installation', link: '/getting-started/installation' },
					],
				},
				{
					label: 'Utilities',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'assertInjector', link: '/utilities/assert-injector' },
						{
							label: 'createInjectionToken',
							link: '/utilities/create-injection-token',
						},
						{ label: 'repeat', link: '/utilities/repeat' },
						{ label: 'resize', link: '/utilities/resize' },
					],
				},
			],
		}),
	],
});
