import { getCollection, type CollectionEntry } from 'astro:content';
import { importLine, importNames } from './exports';

export type Lang = 'en' | 'es';

/**
 * Categories in sidebar order. `dir` is the content folder (lower-cased, as in the page id).
 */
export const categories = [
	{
		dir: 'signal-primitives',
		en: {
			label: 'Signal Primitives',
			blurb: 'Signals that remember, undo, slice and collect.',
		},
		es: {
			label: 'Primitivas de Signals',
			blurb: 'Signals que recuerdan, deshacen, dividen y agrupan.',
		},
	},
	{
		dir: 'signal-async',
		en: {
			label: 'Signal Async',
			blurb: 'Observables, Promises and signals, working together.',
		},
		es: {
			label: 'Signals asíncronos',
			blurb: 'Observables, Promises y signals trabajando juntos.',
		},
	},
	{
		dir: 'effects-side-effects',
		en: {
			label: 'Effects & Side Effects',
			blurb: 'Effects with explicit dependencies and clean teardown.',
		},
		es: {
			label: 'Effects y efectos secundarios',
			blurb: 'Effects con dependencias explícitas y limpieza automática.',
		},
	},
	{
		dir: 'component-utilities',
		en: {
			label: 'Component Utilities',
			blurb: 'Host bindings, attributes and inputs as signals.',
		},
		es: {
			label: 'Utilidades de componentes',
			blurb: 'Host bindings, atributos e inputs como signals.',
		},
	},
	{
		dir: 'router',
		en: {
			label: 'Router',
			blurb: 'Params, query params and route data as signals.',
		},
		es: {
			label: 'Router',
			blurb: 'Params, query params y datos de ruta como signals.',
		},
	},
	{
		dir: 'forms',
		en: {
			label: 'Forms',
			blurb: 'Validators, errors and custom controls with less boilerplate.',
		},
		es: {
			label: 'Formularios',
			blurb: 'Validadores, errores y controles propios con menos código.',
		},
	},
	{
		dir: 'dom-events',
		en: {
			label: 'DOM & Events',
			blurb: 'Clicks, resizes, focus and gestures, cleaned up for you.',
		},
		es: {
			label: 'DOM y eventos',
			blurb:
				'Clics, cambios de tamaño, foco y gestos, con limpieza automática.',
		},
	},
	{
		dir: 'browser-apis',
		en: {
			label: 'Browser APIs',
			blurb: 'Visibility, network, storage and intersection as signals.',
		},
		es: {
			label: 'APIs del navegador',
			blurb: 'Visibilidad, red, almacenamiento e intersección como signals.',
		},
	},
	{
		dir: 'rxjs-operators',
		en: {
			label: 'RxJS Operators',
			blurb: 'Small operators for everyday streams.',
		},
		es: {
			label: 'Operadores RxJS',
			blurb: 'Operadores pequeños para streams de todos los días.',
		},
	},
	{
		dir: 'directives-templates',
		en: {
			label: 'Directives & Templates',
			blurb: 'Pipes and directives that keep templates short.',
		},
		es: {
			label: 'Directivas y plantillas',
			blurb: 'Pipes y directivas que mantienen las plantillas cortas.',
		},
	},
	{
		dir: 'dependency-injection',
		en: {
			label: 'Dependency Injection',
			blurb: 'Tokens, lazy services and injection-context helpers.',
		},
		es: {
			label: 'Inyección de dependencias',
			blurb: 'Tokens, servicios lazy y ayudas para el contexto de inyección.',
		},
	},
	{
		dir: 'http',
		en: { label: 'HTTP', blurb: 'Helpers for HttpClient.' },
		es: { label: 'HTTP', blurb: 'Ayudas para HttpClient.' },
	},
	{
		dir: 'intl',
		en: {
			label: 'Internationalization',
			blurb: 'Pipes on top of the browser Intl API.',
		},
		es: {
			label: 'Internacionalización',
			blurb: 'Pipes sobre la API Intl del navegador.',
		},
	},
	{
		dir: 'testing',
		en: { label: 'Testing', blurb: 'Helpers for testing Angular apps.' },
		es: { label: 'Testing', blurb: 'Ayudas para probar aplicaciones Angular.' },
	},
	{
		dir: 'migrations',
		en: {
			label: 'Migrations',
			blurb: 'Schematics that move your code to modern Angular.',
		},
		es: {
			label: 'Migraciones',
			blurb: 'Schematics que llevan tu código a Angular moderno.',
		},
	},
] as const;

export type CategoryDir = (typeof categories)[number]['dir'];

/**
 * One line per utility, written from the first paragraph of its doc page.
 * Keyed by `<category-dir>/<file-slug>`. Pages without an entry fall back to their first sentence.
 */
export const taglines: Record<string, { en: string; es: string }> = {
	// Signal Primitives
	'signal-primitives/computed-previous': {
		en: 'The previous value of any signal.',
		es: 'El valor anterior de cualquier signal.',
	},
	'signal-primitives/computed': {
		en: '`computed` that receives its previous value.',
		es: '`computed` que recibe su valor anterior.',
	},
	'signal-primitives/create-notifier': {
		en: 'Trigger re-computation by hand.',
		es: 'Fuerza un recálculo cuando tú quieras.',
	},
	'signal-primitives/create-signal': {
		en: 'Signals with a plain `.value` property.',
		es: 'Signals con una propiedad `.value`.',
	},
	'signal-primitives/signal-history': {
		en: 'History with undo and redo for a signal.',
		es: 'Historial con deshacer y rehacer para un signal.',
	},
	'signal-primitives/signal-map': {
		en: 'A Map with per-key reactivity.',
		es: 'Un Map con reactividad por clave.',
	},
	'signal-primitives/signal-set': {
		en: 'A Set that signals track.',
		es: 'Un Set que los signals pueden seguir.',
	},
	'signal-primitives/signal-slice': {
		en: 'Declarative slices of state with actions.',
		es: 'Porciones de estado declarativas con acciones.',
	},
	'signal-primitives/to-lazy-signal': {
		en: '`toSignal` that subscribes on first read.',
		es: '`toSignal` que se suscribe en la primera lectura.',
	},

	// Signal Async
	'signal-async/connect': {
		en: 'Feed an Observable into a signal, unsubscribed on destroy.',
		es: 'Conecta un Observable a un signal; se desuscribe al destruir.',
	},
	'signal-async/derived-async': {
		en: '`computed` for Promises and Observables.',
		es: '`computed` para Promises y Observables.',
	},
	'signal-async/derived-from': {
		en: '`combineLatest` for signals and Observables.',
		es: '`combineLatest` para signals y Observables.',
	},
	'signal-async/merge-from': {
		en: '`merge` for signals and Observables.',
		es: '`merge` para signals y Observables.',
	},
	'signal-async/to-observable-signal': {
		en: 'One value you can read as a signal and subscribe to.',
		es: 'Un valor que puedes leer como signal y suscribir como Observable.',
	},

	// Effects & Side Effects
	'effects-side-effects/auto-effect': {
		en: 'An effect wired to its injector, usable anywhere.',
		es: 'Un effect conectado a su injector, usable en cualquier sitio.',
	},
	'effects-side-effects/create-effect': {
		en: 'NgRx ComponentStore effects, standalone.',
		es: 'Effects de NgRx ComponentStore, sin la store.',
	},
	'effects-side-effects/effect-once-if': {
		en: 'Run an effect once, when a condition is met.',
		es: 'Ejecuta un effect una vez, cuando se cumple una condición.',
	},
	'effects-side-effects/explicit-effect': {
		en: 'An effect that only tracks the signals you list.',
		es: 'Un effect que solo sigue los signals que indicas.',
	},
	'effects-side-effects/on': {
		en: 'Explicit dependencies inside `effect()`.',
		es: 'Dependencias explícitas dentro de `effect()`.',
	},
	'effects-side-effects/rx-effect': {
		en: 'An RxJS side effect that cleans itself up.',
		es: 'Un efecto con RxJS que se limpia solo.',
	},

	// Component Utilities
	'component-utilities/host-binding': {
		en: 'A signal bound to a host property.',
		es: 'Un signal enlazado a una propiedad del host.',
	},
	'component-utilities/inject-attribute': {
		en: 'Read host attributes with `inject()`.',
		es: 'Lee atributos del host con `inject()`.',
	},
	'component-utilities/inject-inputs': {
		en: 'All signal inputs as one object signal.',
		es: 'Todos los inputs como un único signal de objeto.',
	},
	'component-utilities/merge-inputs': {
		en: 'Merge partial object inputs with defaults.',
		es: 'Combina inputs de objeto parciales con valores por defecto.',
	},

	// Router
	'router/inject-leaf-activated-route': {
		en: 'The deepest active route, always current.',
		es: 'La ruta activa más profunda, siempre al día.',
	},
	'router/inject-params': {
		en: 'Route params as a signal.',
		es: 'Los params de la ruta como signal.',
	},
	'router/inject-query-params': {
		en: 'Query params as a signal.',
		es: 'Los query params como signal.',
	},
	'router/inject-route-data': {
		en: 'Route data as a signal.',
		es: 'Los datos de la ruta como signal.',
	},
	'router/inject-route-fragment': {
		en: 'The URL fragment as a signal.',
		es: 'El fragmento de la URL como signal.',
	},
	'router/linked-query-param': {
		en: 'A writable signal synced with a query param.',
		es: 'Un signal editable sincronizado con un query param.',
	},
	'router/navigation-end': {
		en: 'An Observable of finished navigations.',
		es: 'Un Observable de las navegaciones terminadas.',
	},

	// Forms
	'forms/control-error': {
		en: 'Show control errors without the boilerplate.',
		es: 'Muestra los errores de un control sin código repetido.',
	},
	'forms/control-value-accessor': {
		en: 'Custom form controls in a few lines.',
		es: 'Controles de formulario propios en pocas líneas.',
	},
	'forms/form-events': {
		en: 'Every form event as an Observable or signal.',
		es: 'Cada evento del formulario como Observable o signal.',
	},
	'forms/if-validator': {
		en: 'Validators that apply only when a condition holds.',
		es: 'Validadores que solo aplican si se cumple una condición.',
	},
	'forms/not-pattern': {
		en: 'Valid only when the value does not match.',
		es: 'Válido solo si el valor no coincide con el patrón.',
	},

	// DOM & Events
	'dom-events/active-element': {
		en: 'Know which element has focus.',
		es: 'Sabe qué elemento tiene el foco.',
	},
	'dom-events/click-outside': {
		en: 'React to clicks outside an element.',
		es: 'Reacciona a clics fuera de un elemento.',
	},
	'dom-events/gesture-intro': {
		en: 'Drag, pinch, scroll and more, for Angular.',
		es: 'Arrastrar, pellizcar, desplazar y más, para Angular.',
	},
	'dom-events/gesture': {
		en: 'How to bind gestures to elements.',
		es: 'Cómo enlazar gestos a elementos.',
	},
	'dom-events/on-event': {
		en: 'Event listeners that clean up after themselves.',
		es: 'Listeners de eventos que se limpian solos.',
	},
	'dom-events/resize': {
		en: 'Observe size changes of an element.',
		es: 'Observa los cambios de tamaño de un elemento.',
	},

	// Browser APIs
	'browser-apis/inject-document-visibility': {
		en: 'Whether the tab is visible, as a signal.',
		es: 'Si la pestaña está visible, como signal.',
	},
	'browser-apis/inject-is-intersecting': {
		en: 'Know when an element enters the viewport.',
		es: 'Sabe cuándo un elemento entra en pantalla.',
	},
	'browser-apis/inject-local-storage': {
		en: 'localStorage as a writable signal.',
		es: 'localStorage como signal editable.',
	},
	'browser-apis/inject-network': {
		en: 'Online state and connection type.',
		es: 'Estado de conexión y tipo de red.',
	},
	'browser-apis/inject-text-selection': {
		en: 'The user’s text selection, as signals.',
		es: 'El texto seleccionado por el usuario, como signals.',
	},

	// RxJS Operators
	'rxjs-operators/create-repeat': {
		en: '`repeat` you can trigger with `.emit()`.',
		es: '`repeat` que puedes disparar con `.emit()`.',
	},
	'rxjs-operators/debug': {
		en: 'Log every event of a stream, tagged.',
		es: 'Registra cada evento de un stream con una etiqueta.',
	},
	'rxjs-operators/derive-loading': {
		en: 'A loading flag that doesn’t flicker.',
		es: 'Un indicador de carga que no parpadea.',
	},
	'rxjs-operators/filter-array': {
		en: '`Array.filter` on emitted arrays.',
		es: '`Array.filter` sobre arrays emitidos.',
	},
	'rxjs-operators/filter-nil': {
		en: 'Drop `null` and `undefined`.',
		es: 'Descarta `null` y `undefined`.',
	},
	'rxjs-operators/map-array': {
		en: '`Array.map` on emitted arrays.',
		es: '`Array.map` sobre arrays emitidos.',
	},
	'rxjs-operators/map-skip-undefined': {
		en: '`map` that skips `undefined` results.',
		es: '`map` que omite los resultados `undefined`.',
	},
	'rxjs-operators/poll': {
		en: 'Poll a source at a fixed interval.',
		es: 'Consulta una fuente a intervalos fijos.',
	},
	'rxjs-operators/reduce-array': {
		en: '`Array.reduce` on emitted arrays.',
		es: '`Array.reduce` sobre arrays emitidos.',
	},
	'rxjs-operators/take-latest-from': {
		en: '`withLatestFrom` that waits for every source.',
		es: '`withLatestFrom` que espera a todas las fuentes.',
	},
	'rxjs-operators/when-document-visible': {
		en: 'Pause a stream while the tab is hidden.',
		es: 'Pausa un stream mientras la pestaña está oculta.',
	},

	// Directives & Templates
	'directives-templates/call-apply': {
		en: 'Call pure functions from templates, memoized.',
		es: 'Llama funciones puras desde la plantilla, con memoización.',
	},
	'directives-templates/repeat-pipe': {
		en: 'Loop N times with `@for`.',
		es: 'Repite N veces con `@for`.',
	},
	'directives-templates/repeat': {
		en: 'Render a template N times.',
		es: 'Renderiza una plantilla N veces.',
	},
	'directives-templates/svg-sprites': {
		en: 'Render symbols from SVG sprites.',
		es: 'Renderiza símbolos de sprites SVG.',
	},
	'directives-templates/trackby-id-prop': {
		en: 'trackBy by id or any property.',
		es: 'trackBy por id o por cualquier propiedad.',
	},

	// Dependency Injection
	'dependency-injection/assert-injector': {
		en: 'Run code in an injection context, or fail clearly.',
		es: 'Ejecuta código en un contexto de inyección o falla con claridad.',
	},
	'dependency-injection/create-injectable': {
		en: 'Services from plain functions.',
		es: 'Servicios a partir de funciones.',
	},
	'dependency-injection/create-injection-token': {
		en: 'A token with its inject and provide functions.',
		es: 'Un token con sus funciones inject y provide.',
	},
	'dependency-injection/inject-destroy': {
		en: 'A destroy$ you never have to complete.',
		es: 'Un destroy$ que nunca tienes que completar.',
	},
	'dependency-injection/inject-lazy': {
		en: 'Lazy-load a service when you need it.',
		es: 'Carga un servicio solo cuando lo necesitas.',
	},
	'dependency-injection/singleton-proxy': {
		en: 'A singleton created on first use.',
		es: 'Un singleton creado en el primer uso.',
	},

	// Others
	'http/merge-http-context': {
		en: 'Combine several HttpContexts into one.',
		es: 'Combina varios HttpContext en uno.',
	},
	'intl/intl': {
		en: 'Pipes for dates, numbers, lists and more.',
		es: 'Pipes para fechas, números, listas y más.',
	},
	'testing/testing': {
		en: 'Helpers for component and DOM tests.',
		es: 'Ayudas para pruebas de componentes y del DOM.',
	},
	'migrations/host-binding-migration': {
		en: 'Move @HostBinding and @HostListener to `host`.',
		es: 'Pasa @HostBinding y @HostListener a `host`.',
	},
	'migrations/sfc-migration': {
		en: 'Move templates and styles inline.',
		es: 'Lleva plantillas y estilos al propio componente.',
	},
};

export interface Utility {
	/** Human title from frontmatter, e.g. `linkedQueryParam` */
	title: string;
	/** Category folder, e.g. `router` */
	category: CategoryDir;
	/** `<category>/<file>` key */
	key: string;
	/** Link to the page (English pages are the source of truth; `/es/` falls back to them) */
	href: string;
	/** e.g. `ngxtension/linked-query-param` */
	entryPoint?: string;
	badge?: 'stable' | 'unstable' | 'experimental' | 'deprecated';
	tagline: string;
	/** Real export names (from the page's own import or the library source) */
	importNames: string[];
	/** `import { … } from 'ngxtension/…';` or undefined when the page has no import */
	importLine?: string;
}

function firstSentence(body: string | undefined): string {
	if (!body) return '';
	const lines = body.split('\n');
	let inCode = false;
	for (const raw of lines) {
		const line = raw.trim();
		if (line.startsWith('```')) {
			inCode = !inCode;
			continue;
		}
		if (inCode || !line || /^(import |#|:::|<|-|\|)/.test(line)) continue;
		const sentence = line.split(/(?<=\.)\s/)[0];
		return sentence.length > 110 ? `${sentence.slice(0, 107)}…` : sentence;
	}
	return '';
}

/** All English utility pages, grouped and sorted in sidebar order. */
export async function getUtilities(lang: Lang = 'en'): Promise<Utility[]> {
	const entries: CollectionEntry<'docs'>[] = await getCollection('docs', (e) =>
		e.id.startsWith('utilities/'),
	);
	const order = new Map(categories.map((c, i) => [c.dir, i] as const));
	const prefix = lang === 'en' ? '' : `/${lang}`;

	return entries
		.map((e) => {
			// Legacy collection ids keep folder case and extension: utilities/Router/inject-params.md
			const [, category, file] = e.id
				.replace(/\.mdx?$/, '')
				.toLowerCase()
				.split('/');
			const key = `${category}/${file}`;
			const title = String(e.data.title).replace(/^'|'$/g, '');
			const names = importNames(e.data.entryPoint, title, e.body);
			return {
				title,
				category: category as CategoryDir,
				key,
				href: `${prefix}/utilities/${category}/${file}/`,
				entryPoint: e.data.entryPoint,
				badge: e.data.badge,
				tagline: taglines[key]?.[lang] ?? firstSentence(e.body),
				importNames: names,
				importLine: importLine(e.data.entryPoint, names),
			} satisfies Utility;
		})
		.filter((u) => order.has(u.category))
		.sort(
			(a, b) =>
				order.get(a.category)! - order.get(b.category)! ||
				a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
		);
}

/** Utilities grouped by category, in sidebar order. */
export async function getUtilityGroups(lang: Lang = 'en') {
	const all = await getUtilities(lang);
	return categories
		.map((c) => ({
			dir: c.dir,
			label: c[lang].label,
			blurb: c[lang].blurb,
			items: all.filter((u) => u.category === c.dir),
		}))
		.filter((g) => g.items.length > 0);
}

/** Render `code` spans in a tagline as <code>. Taglines are our own strings, so this is safe. */
export function taglineHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/`([^`]+)`/g, '<code>$1</code>');
}
