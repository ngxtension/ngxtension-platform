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
						{
							label: 'computedFrom',
							link: '/utilities/computed-from',
						},
						{
							label: 'injectDestroy',
							link: '/utilities/inject-destroy',
						},
						{
							label: 'connect',
							link: '/utilities/connect',
						},
						{ label: 'repeat', link: '/utilities/repeat' },
						{ label: 'resize', link: '/utilities/resize' },
						{ label: 'createEffect', link: '/utilities/create-effect' },
						{ label: 'ifValidator', link: '/utilities/if-validator' },
					],
				},
			],
		}),
	],
});
