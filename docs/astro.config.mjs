import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export const locales = {
	root: { label: 'English', lang: 'en' },
	es: { label: 'Español', lang: 'es' },
};

// https://astro.build/config
export default defineConfig({
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
			social: {
				github: 'https://github.com/nartc/ngxtension-platform',
				twitter: 'https://twitter.com/Nartc1410',
			},
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
					label: 'Utilities',
					autogenerate: { directory: 'utilities' },
					translations: {
						es: 'Utilidades',
					},
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
