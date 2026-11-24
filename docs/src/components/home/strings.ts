import type { Lang } from '../../data/utilities';

const en = {
	eyebrow: 'Open source · MIT',
	titleA: 'Delete the',
	titleStrike: 'boilerplate.',
	titleB: 'Keep the Angular.',
	lead: 'ngxtension is a collection of {n} small utilities for signals, the router, forms, RxJS and the DOM. Each one is its own entry point, so you only ship what you import.',
	start: 'Get started',
	copyInstall: 'Copy the install command',
	copied: 'Copied',
	github: 'GitHub',
	githubLabel: 'ngxtension on GitHub',
	browse: 'Browse all {n} utilities',

	demoTitle: 'Same component. Fewer lines.',
	demoLead:
		'Three jobs every Angular app has, first in plain Angular, then with ngxtension. Watch each one shrink, or flip it yourself.',
	stages: [
		{
			title: 'Keep the search box in the URL',
			caption:
				'Instead of reading <code>ActivatedRoute</code> and calling the router by hand, <code>linkedQueryParam</code> gives you a signal that writes to the URL, and a URL that writes to the signal.',
		},
		{
			title: 'Listen to window events without leaks',
			caption:
				'<code>onEvent</code> adds the listener and removes it when the component is destroyed, with the same <code>AbortController</code> you would write yourself.',
		},
		{
			title: 'Keep a setting in localStorage',
			caption:
				'<code>injectLocalStorage</code> reads the stored value, writes every change back, and follows other tabs through the <code>storage</code> event. What you get is a plain <code>WritableSignal</code>.',
		},
	],
	stage: {
		before: 'Plain Angular',
		after: 'ngxtension',
		lines: 'lines',
		removed: 'lines you no longer write',
		docs: 'Read the {name} docs',
		toggle: 'Show the code as',
		live: '{n} lines in {state}',
	},

	indexTitle: 'Every utility, by chapter',
	indexLead:
		'{count} utilities in {chapters} chapters. Search by the problem you have, or browse.',
	chapter: 'Chapter',
	chapters: 'Chapters',
	more: 'More',
	moreBlurb: 'HTTP, internationalization, testing and migrations.',
	utilities: (n: number) => (n === 1 ? '1 utility' : `${n} utilities`),
	of: 'of',
	badges: {
		experimental: 'Experimental',
		unstable: 'Unstable',
		deprecated: 'Deprecated',
		stable: 'Stable',
	},

	finder: {
		label: 'I want to',
		placeholder: 'sync a signal with the URL…',
		try: 'Try',
		list: 'Matching utilities',
		countAll: '{n} utilities',
		countSome: '{n} utilities match “{q}”',
		countSomeOne: '1 utility matches “{q}”',
		countNone: 'Nothing matches “{q}”',
		emptyTitle: 'No utility for that yet.',
		emptyBody: 'Try fewer words, or browse the chapters below.',
		emptyIssue: 'Suggest one on GitHub',
		move: 'move',
		open: 'open',
		clear: 'clear',
		focus: 'search',
		copyImport: 'Copy import',
		openDocs: 'Read the docs',
	},

	endTitle: 'Start with one import.',
	endLead:
		'Add it to the app you already have. Pick one utility, import it, and delete the code it replaces.',
	endStart: 'Read the introduction',
	endSponsor: 'Sponsor on Open Collective',
	credits:
		'{n} people are credited on these pages. ngxtension is MIT licensed, and contributions are welcome.',
	creditsLabel: 'People credited on these pages',
};

export type Strings = typeof en;

const es: Strings = {
	eyebrow: 'Código abierto · MIT',
	titleA: 'Borra el',
	titleStrike: 'boilerplate.',
	titleB: 'Quédate con Angular.',
	lead: 'ngxtension reúne {n} utilidades pequeñas para signals, el router, formularios, RxJS y el DOM. Cada una tiene su propio punto de entrada, así que solo empaquetas lo que importas.',
	start: 'Empezar',
	copyInstall: 'Copiar el comando de instalación',
	copied: 'Copiado',
	github: 'GitHub',
	githubLabel: 'ngxtension en GitHub',
	browse: 'Ver las {n} utilidades',

	demoTitle: 'El mismo componente. Menos líneas.',
	demoLead:
		'Tres tareas que tiene cualquier app de Angular: primero en Angular puro, después con ngxtension. Mira cómo se reducen, o cámbialo tú.',
	stages: [
		{
			title: 'Guarda la búsqueda en la URL',
			caption:
				'En vez de leer <code>ActivatedRoute</code> y llamar al router a mano, <code>linkedQueryParam</code> te da un signal que escribe en la URL, y una URL que escribe en el signal.',
		},
		{
			title: 'Escucha eventos de window sin fugas',
			caption:
				'<code>onEvent</code> añade el listener y lo quita cuando el componente se destruye, con el mismo <code>AbortController</code> que escribirías tú.',
		},
		{
			title: 'Guarda un ajuste en localStorage',
			caption:
				'<code>injectLocalStorage</code> lee el valor guardado, escribe cada cambio y sigue a las otras pestañas con el evento <code>storage</code>. Lo que recibes es un <code>WritableSignal</code> normal.',
		},
	],
	stage: {
		before: 'Angular puro',
		after: 'ngxtension',
		lines: 'líneas',
		removed: 'líneas que ya no escribes',
		docs: 'Leer la documentación de {name}',
		toggle: 'Ver el código como',
		live: '{n} líneas en {state}',
	},

	indexTitle: 'Todas las utilidades, por capítulo',
	indexLead:
		'{count} utilidades en {chapters} capítulos. Busca por el problema que tienes, o explora.',
	chapter: 'Capítulo',
	chapters: 'Capítulos',
	more: 'Más',
	moreBlurb: 'HTTP, internacionalización, testing y migraciones.',
	utilities: (n: number) => (n === 1 ? '1 utilidad' : `${n} utilidades`),
	of: 'de',
	badges: {
		experimental: 'Experimental',
		unstable: 'Inestable',
		deprecated: 'Obsoleto',
		stable: 'Estable',
	},

	finder: {
		label: 'Quiero',
		placeholder: 'sincronizar un signal con la URL…',
		try: 'Prueba',
		list: 'Utilidades que coinciden',
		countAll: '{n} utilidades',
		countSome: '{n} utilidades coinciden con “{q}”',
		countSomeOne: '1 utilidad coincide con “{q}”',
		countNone: 'Nada coincide con “{q}”',
		emptyTitle: 'Todavía no hay una utilidad para eso.',
		emptyBody: 'Prueba con menos palabras o explora los capítulos de abajo.',
		emptyIssue: 'Propón una en GitHub',
		move: 'mover',
		open: 'abrir',
		clear: 'borrar',
		focus: 'buscar',
		copyImport: 'Copiar import',
		openDocs: 'Leer la documentación',
	},

	endTitle: 'Empieza con un import.',
	endLead:
		'Añádelo a la app que ya tienes. Elige una utilidad, impórtala y borra el código que sustituye.',
	endStart: 'Leer la introducción',
	endSponsor: 'Patrocinar en Open Collective',
	credits:
		'{n} personas aparecen como autoras en estas páginas. ngxtension tiene licencia MIT y las contribuciones son bienvenidas.',
	creditsLabel: 'Personas que aparecen como autoras',
};

export const strings: Record<Lang, Strings> = { en, es };
