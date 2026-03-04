import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export const locales = {
	root: { label: 'English', lang: 'en' },
	es: { label: 'Español', lang: 'es' },
};

// https://astro.build/config
export default defineConfig({
	markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme: 'tokyo-night',
			wrap: true,
			themes: {
				light: 'github-light',
				dark: 'tokyo-night',
			},
		},
	},
	integrations: [
		starlight({
			title: 'ngxtension',
			logo: {
				light: './public/ngxtension-blue.svg',
				dark: './public/ngxtension-white.svg',
				alt: 'ngxtension logo',
				replacesTitle: true,
			},
			favicon: './ngxt-blue.svg',
			social: [
				{
					label: 'GitHub',
					icon: 'github',
					href: 'https://github.com/ngxtension/ngxtension-platform',
				},
				{
					label: 'Twitter',
					icon: 'twitter',
					href: 'https://twitter.com/Nartc1410',
				},
			],
			customCss: ['./src/styles/custom.css'],
			lastUpdated: true,
			sidebar: [
				{
					label: 'Getting Started',
					autogenerate: { directory: 'getting-started' },
					translations: {
						es: 'Inicio',
					},
				},
				{
					label: 'Signal Primitives',
					autogenerate: { directory: 'utilities/Signal-Primitives' },
				},
				{
					label: 'Signal Async',
					autogenerate: { directory: 'utilities/Signal-Async' },
				},
				{
					label: 'Effects & Side Effects',
					autogenerate: { directory: 'utilities/Effects-Side-Effects' },
				},
				{
					label: 'Component Utilities',
					autogenerate: { directory: 'utilities/Component-Utilities' },
				},
				{
					label: 'Router',
					autogenerate: { directory: 'utilities/Router' },
				},
				{
					label: 'Forms',
					autogenerate: { directory: 'utilities/Forms' },
				},
				{
					label: 'DOM & Events',
					autogenerate: { directory: 'utilities/DOM-Events' },
				},
				{
					label: 'Browser APIs',
					autogenerate: { directory: 'utilities/Browser-APIs' },
				},
				{
					label: 'RxJS Operators',
					autogenerate: { directory: 'utilities/RxJS-Operators' },
				},
				{
					label: 'Directives & Templates',
					autogenerate: { directory: 'utilities/Directives-Templates' },
				},
				{
					label: 'Dependency Injection',
					autogenerate: { directory: 'utilities/Dependency-Injection' },
				},
				{
					label: 'HTTP',
					autogenerate: { directory: 'utilities/Http' },
				},
				{
					label: 'Internationalization',
					autogenerate: { directory: 'utilities/Intl' },
				},
				{
					label: 'Testing',
					autogenerate: { directory: 'utilities/Testing' },
				},
				{
					label: 'Migrations',
					autogenerate: { directory: 'utilities/Migrations' },
				},
				{
					label: 'Project Graph',
					translations: {
						es: 'Gráfico de Proyecto',
					},
					link: '/dep-graph',
				},
				{
					label: 'Press Kit',
					link: '/logos/logos',
				},
			],
			components: {
				PageTitle: './src/components/PageTitle.astro',
				MarkdownContent: './src/components/Content.astro',
				Sidebar: './src/components/Sidebar.astro',
			},
			defaultLocale: 'root',
			locales,
		}),
	],
});
