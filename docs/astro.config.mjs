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
				TableOfContents: './src/components/TableOfContents.astro',
			},
			defaultLocale: 'root',
			locales,
		}),
	],
	redirects: {
		// Browser APIs
		'/utilities/inject-document-visibility':
			'/utilities/browser-apis/inject-document-visibility',
		'/utilities/inject-is-intersecting':
			'/utilities/browser-apis/inject-is-intersecting',
		'/utilities/inject-local-storage':
			'/utilities/browser-apis/inject-local-storage',
		'/utilities/injectors/inject-network':
			'/utilities/browser-apis/inject-network',
		'/utilities/inject-text-selection':
			'/utilities/browser-apis/inject-text-selection',

		// Component Utilities
		'/utilities/host-binding': '/utilities/component-utilities/host-binding',
		'/utilities/inject-attribute':
			'/utilities/component-utilities/inject-attribute',
		'/utilities/inject-inputs': '/utilities/component-utilities/inject-inputs',
		'/utilities/merge-inputs': '/utilities/component-utilities/merge-inputs',

		// DOM Events
		'/utilities/injectors/active-element':
			'/utilities/dom-events/active-element',
		'/utilities/directives/click-outside':
			'/utilities/dom-events/click-outside',
		'/utilities/gesture/intro': '/utilities/dom-events/gesture-intro',
		'/utilities/gesture/gesture': '/utilities/dom-events/gesture',
		'/utilities/events/on-event': '/utilities/dom-events/on-event',
		'/utilities/directives/resize': '/utilities/dom-events/resize',

		// Dependency Injection
		'/utilities/assert-injector':
			'/utilities/dependency-injection/assert-injector',
		'/utilities/create-injectable':
			'/utilities/dependency-injection/create-injectable',
		'/utilities/create-injection-token':
			'/utilities/dependency-injection/create-injection-token',
		'/utilities/inject-destroy':
			'/utilities/dependency-injection/inject-destroy',
		'/utilities/inject-lazy': '/utilities/dependency-injection/inject-lazy',
		'/utilities/singleton-proxy':
			'/utilities/dependency-injection/singleton-proxy',

		// Directives & Templates
		'/utilities/pipes/call-apply': '/utilities/directives-templates/call-apply',
		'/utilities/directives/repeat-pipe':
			'/utilities/directives-templates/repeat-pipe',
		'/utilities/repeat': '/utilities/directives-templates/repeat',
		'/utilities/svg-sprites': '/utilities/directives-templates/svg-sprites',
		'/utilities/trackby-id-prop':
			'/utilities/directives-templates/trackby-id-prop',

		// Effects & Side Effects
		'/utilities/auto-effect': '/utilities/effects-side-effects/auto-effect',
		'/utilities/create-effect': '/utilities/effects-side-effects/create-effect',
		'/utilities/effect-once-if':
			'/utilities/effects-side-effects/effect-once-if',
		'/utilities/explicit-effect':
			'/utilities/effects-side-effects/explicit-effect',
		'/utilities/signals/on': '/utilities/effects-side-effects/on',
		'/utilities/rx-effect': '/utilities/effects-side-effects/rx-effect',

		// Router
		'/utilities/inject-leaf-activated-route':
			'/utilities/router/inject-leaf-activated-route',
		'/utilities/injectors/inject-params': '/utilities/router/inject-params',
		'/utilities/injectors/inject-query-params':
			'/utilities/router/inject-query-params',
		'/utilities/injectors/inject-route-data':
			'/utilities/router/inject-route-data',
		'/utilities/injectors/inject-route-fragment':
			'/utilities/router/inject-route-fragment',
		'/utilities/injectors/linked-query-param':
			'/utilities/router/linked-query-param',
		'/utilities/injectors/navigation-end': '/utilities/router/navigation-end',

		// RxJS Operators
		'/utilities/operators/create-repeat':
			'/utilities/rxjs-operators/create-repeat',
		'/utilities/operators/debug': '/utilities/rxjs-operators/debug',
		'/utilities/derive-loading': '/utilities/rxjs-operators/derive-loading',
		'/utilities/operators/filter-array':
			'/utilities/rxjs-operators/filter-array',
		'/utilities/operators/filter-nil': '/utilities/rxjs-operators/filter-nil',
		'/utilities/operators/map-array': '/utilities/rxjs-operators/map-array',
		'/utilities/map-skip-undefined':
			'/utilities/rxjs-operators/map-skip-undefined',
		'/utilities/operators/poll': '/utilities/rxjs-operators/poll',
		'/utilities/operators/reduce-array':
			'/utilities/rxjs-operators/reduce-array',
		'/utilities/take-latest-from': '/utilities/rxjs-operators/take-latest-from',
		'/utilities/when-document-visible':
			'/utilities/rxjs-operators/when-document-visible',

		// Signal Async
		'/utilities/signals/connect': '/utilities/signal-async/connect',
		'/utilities/signals/derived-async': '/utilities/signal-async/derived-async',
		'/utilities/signals/derived-from': '/utilities/signal-async/derived-from',
		'/utilities/signals/merge-from': '/utilities/signal-async/merge-from',
		'/utilities/to-observable-signal':
			'/utilities/signal-async/to-observable-signal',

		// Signal Primitives
		'/utilities/computed-previous':
			'/utilities/signal-primitives/computed-previous',
		'/utilities/signals/computed': '/utilities/signal-primitives/computed',
		'/utilities/create-notifier':
			'/utilities/signal-primitives/create-notifier',
		'/utilities/create-signal': '/utilities/signal-primitives/create-signal',
		'/utilities/signal-history': '/utilities/signal-primitives/signal-history',
		'/utilities/signal-map': '/utilities/signal-primitives/signal-map',
		'/utilities/signal-set': '/utilities/signal-primitives/signal-set',
		'/utilities/signals/signal-slice':
			'/utilities/signal-primitives/signal-slice',
		'/utilities/to-lazy-signal': '/utilities/signal-primitives/to-lazy-signal',
	},
});
