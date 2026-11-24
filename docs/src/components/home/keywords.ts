/**
 * Search words per utility, written from each doc page: the words someone types when they have the
 * problem but not the function name. Keyed like `src/data/utilities.ts`. Spanish words are added on
 * the Spanish homepage, so both languages can be typed there.
 */
export const keywords: Record<string, string> = {
	// Signal Primitives
	'signal-primitives/computed-previous':
		'previous value last old prior compare change before',
	'signal-primitives/computed':
		'extended computed previous accumulate reduce derived state',
	'signal-primitives/create-notifier':
		'notify trigger refresh reload manual recompute tick invalidate',
	'signal-primitives/create-signal':
		'value property getter setter writable signal',
	'signal-primitives/signal-history':
		'undo redo history time travel revert back forward',
	'signal-primitives/signal-map':
		'map dictionary key value collection reactive record',
	'signal-primitives/signal-set': 'set unique collection selection reactive',
	'signal-primitives/signal-slice':
		'state management store slice actions reducer redux selectors',
	'signal-primitives/to-lazy-signal':
		'lazy tosignal defer subscribe first read http request observable fetch data',

	// Signal Async
	'signal-async/connect':
		'observable stream subscribe signal feed unsubscribe destroy state reducer',
	'signal-async/derived-async':
		'async computed promise observable http fetch load switchmap resource',
	'signal-async/derived-from':
		'combinelatest combine signals observables derive pipe switchmap',
	'signal-async/merge-from': 'merge signals observables latest stream',
	'signal-async/to-observable-signal':
		'observable signal both subscribe tosignal toobservable',

	// Effects & Side Effects
	'effects-side-effects/auto-effect':
		'effect injector constructor injection context cleanup anywhere',
	'effects-side-effects/create-effect':
		'ngrx componentstore effect trigger observable side effect',
	'effects-side-effects/effect-once-if':
		'once run one time condition first time effect',
	'effects-side-effects/explicit-effect':
		'effect dependencies deps untracked explicit track only',
	'effects-side-effects/on':
		'effect dependencies explicit untracked track only deps',
	'effects-side-effects/rx-effect':
		'rxjs subscribe side effect takeuntildestroyed cleanup unsubscribe',

	// Component Utilities
	'component-utilities/host-binding':
		'host binding class style attribute hostbinding element',
	'component-utilities/inject-attribute': 'attribute host static read inject',
	'component-utilities/inject-inputs':
		'inputs all object component directive signal inputs',
	'component-utilities/merge-inputs':
		'merge default options config partial object input',

	// Router
	'router/inject-leaf-activated-route':
		'activated route child deepest nested leaf current route',
	'router/inject-params':
		'read route params url path parameter id signal activatedroute',
	'router/inject-query-params':
		'query params url search parameter signal read activatedroute',
	'router/inject-route-data': 'route data resolver resolve signal',
	'router/inject-route-fragment': 'fragment hash anchor url',
	'router/linked-query-param':
		'query param url sync write update two way binding pagination filter search state',
	'router/navigation-end':
		'navigation end router events navigated route change',

	// Forms
	'forms/control-error': 'form errors validation messages show display error',
	'forms/control-value-accessor':
		'controlvalueaccessor custom form control ngmodel formcontrol input component',
	'forms/form-events':
		'form value status changes events touched pristine dirty valuechanges',
	'forms/if-validator':
		'conditional validator required when condition validation',
	'forms/not-pattern': 'validator pattern regex forbid disallow not match',

	// DOM & Events
	'dom-events/active-element': 'focus focused element active focusin',
	'dom-events/click-outside':
		'click outside close dropdown menu popover dismiss modal',
	'dom-events/gesture-intro':
		'gesture drag pinch swipe touch mouse wheel scroll move hover',
	'dom-events/gesture':
		'gesture drag pinch swipe touch mouse wheel scroll move hover',
	'dom-events/on-event':
		'event listener addeventlistener window document resize scroll keyboard cleanup',
	'dom-events/resize':
		'resize size width height resizeobserver element dimensions',

	// Browser APIs
	'browser-apis/inject-document-visibility':
		'tab visible hidden visibility page background document',
	'browser-apis/inject-is-intersecting':
		'intersection observer viewport visible scroll lazy load infinite in view',
	'browser-apis/inject-local-storage':
		'localstorage storage persist save remember sync',
	'browser-apis/inject-network':
		'online offline network connection wifi cellular',
	'browser-apis/inject-text-selection':
		'text selection selected highlight copy',

	// RxJS Operators
	'rxjs-operators/create-repeat': 'repeat retry refresh reload emit trigger',
	'rxjs-operators/debug': 'debug log console tap trace',
	'rxjs-operators/derive-loading':
		'loading spinner pending busy flicker indicator',
	'rxjs-operators/filter-array': 'filter array list items',
	'rxjs-operators/filter-nil': 'null undefined filter skip empty nil',
	'rxjs-operators/map-array': 'map array list items transform',
	'rxjs-operators/map-skip-undefined': 'map skip undefined filter transform',
	'rxjs-operators/poll': 'poll polling interval timer refresh periodic api',
	'rxjs-operators/reduce-array': 'reduce array sum total accumulate list',
	'rxjs-operators/take-latest-from': 'withlatestfrom latest combine wait',
	'rxjs-operators/when-document-visible':
		'pause resume tab hidden visible polling stop background',

	// Directives & Templates
	'directives-templates/call-apply':
		'call function template pipe memoize pure method',
	'directives-templates/repeat-pipe': 'repeat loop times range number for',
	'directives-templates/repeat': 'repeat loop times range number ngfor',
	'directives-templates/svg-sprites': 'svg sprite icon symbol use',
	'directives-templates/trackby-id-prop':
		'trackby ngfor id property track performance list',

	// Dependency Injection
	'dependency-injection/assert-injector':
		'injection context injector assert error',
	'dependency-injection/create-injectable':
		'service function injectable provider no class',
	'dependency-injection/create-injection-token':
		'injection token provide inject factory',
	'dependency-injection/inject-destroy':
		'destroy ondestroy takeuntil unsubscribe lifecycle',
	'dependency-injection/inject-lazy':
		'lazy load service dynamic import code split',
	'dependency-injection/singleton-proxy': 'singleton lazy instance proxy class',

	// Others
	'http/merge-http-context':
		'http context httpclient interceptor merge fetch request',
	'intl/intl':
		'format date number currency list plural relative time locale i18n',
	'testing/testing': 'test testing spec dom component helper',
	'migrations/host-binding-migration':
		'migrate hostbinding hostlistener host schematic upgrade',
	'migrations/sfc-migration':
		'migrate inline template styles single file component schematic',
};

export const keywordsEs: Record<string, string> = {
	'signal-primitives/computed-previous':
		'valor anterior previo comparar cambio',
	'signal-primitives/computed':
		'computed extendido valor anterior acumular estado derivado',
	'signal-primitives/create-notifier':
		'notificar disparar refrescar recargar recalcular invalidar',
	'signal-primitives/create-signal': 'valor propiedad signal editable',
	'signal-primitives/signal-history': 'deshacer rehacer historial volver atras',
	'signal-primitives/signal-map':
		'mapa diccionario clave valor coleccion reactivo',
	'signal-primitives/signal-set': 'conjunto unico coleccion seleccion reactivo',
	'signal-primitives/signal-slice':
		'estado gestion store porcion acciones redux selectores',
	'signal-primitives/to-lazy-signal':
		'perezoso diferir suscribir primera lectura peticion observable',
	'signal-async/connect':
		'observable stream suscribir conectar desuscribir destruir estado',
	'signal-async/derived-async':
		'asincrono computed promesa observable http cargar resource',
	'signal-async/derived-from': 'combinar signals observables derivar',
	'signal-async/merge-from': 'combinar fusionar signals observables ultimo',
	'signal-async/to-observable-signal': 'observable signal ambos suscribir',
	'effects-side-effects/auto-effect':
		'effect efecto injector constructor contexto inyeccion limpieza',
	'effects-side-effects/create-effect':
		'ngrx componentstore efecto disparar observable',
	'effects-side-effects/effect-once-if':
		'una vez ejecutar condicion primera efecto',
	'effects-side-effects/explicit-effect':
		'efecto dependencias explicitas untracked solo seguir',
	'effects-side-effects/on': 'efecto dependencias explicitas untracked solo',
	'effects-side-effects/rx-effect':
		'rxjs suscribir efecto limpieza desuscribir',
	'component-utilities/host-binding':
		'host enlace clase estilo atributo elemento',
	'component-utilities/inject-attribute':
		'atributo host estatico leer inyectar',
	'component-utilities/inject-inputs':
		'inputs todos objeto componente directiva entradas',
	'component-utilities/merge-inputs':
		'combinar fusionar defecto opciones configuracion parcial objeto entrada',
	'router/inject-leaf-activated-route':
		'ruta activa hija profunda anidada actual',
	'router/inject-params': 'leer parametros ruta url id signal',
	'router/inject-query-params':
		'leer query params parametros consulta url busqueda signal',
	'router/inject-route-data': 'datos ruta resolver signal',
	'router/inject-route-fragment': 'fragmento hash ancla url',
	'router/linked-query-param':
		'query param parametro url sincronizar escribir guardar busqueda filtro paginacion estado',
	'router/navigation-end': 'navegacion fin eventos router cambio ruta',
	'forms/control-error': 'formulario errores validacion mensajes mostrar error',
	'forms/control-value-accessor':
		'control formulario propio personalizado ngmodel componente',
	'forms/form-events': 'formulario valor estado cambios eventos tocado',
	'forms/if-validator':
		'validador condicional requerido cuando condicion validacion',
	'forms/not-pattern': 'validador patron regex prohibir no coincidir',
	'dom-events/active-element': 'foco enfocado elemento activo',
	'dom-events/click-outside':
		'clic fuera cerrar desplegable menu popover modal',
	'dom-events/gesture-intro':
		'gesto arrastrar pellizcar deslizar tactil raton rueda',
	'dom-events/gesture': 'gesto arrastrar pellizcar deslizar tactil raton rueda',
	'dom-events/on-event':
		'evento escuchar listener window ventana pestana document resize redimensionar scroll teclado limpieza',
	'dom-events/resize': 'tamano ancho alto redimensionar elemento dimensiones',
	'browser-apis/inject-document-visibility':
		'pestana visible oculta visibilidad pagina segundo plano',
	'browser-apis/inject-is-intersecting':
		'interseccion viewport visible pantalla scroll carga perezosa infinito',
	'browser-apis/inject-local-storage':
		'guardar persistir almacenamiento recordar sincronizar',
	'browser-apis/inject-network': 'conexion red online offline wifi',
	'browser-apis/inject-text-selection': 'texto seleccion seleccionado copiar',
	'rxjs-operators/create-repeat':
		'repetir reintentar refrescar recargar disparar',
	'rxjs-operators/debug': 'depurar log consola registrar',
	'rxjs-operators/derive-loading':
		'cargando carga spinner pendiente parpadeo indicador',
	'rxjs-operators/filter-array': 'filtrar array lista elementos',
	'rxjs-operators/filter-nil': 'null undefined filtrar omitir vacio',
	'rxjs-operators/map-array': 'mapear transformar array lista elementos',
	'rxjs-operators/map-skip-undefined':
		'mapear omitir undefined filtrar transformar',
	'rxjs-operators/poll':
		'polling consultar intervalo temporizador refrescar periodico api',
	'rxjs-operators/reduce-array': 'reducir array suma total acumular lista',
	'rxjs-operators/take-latest-from': 'ultimo combinar esperar',
	'rxjs-operators/when-document-visible':
		'pausar reanudar pestana oculta visible polling detener segundo plano',
	'directives-templates/call-apply':
		'llamar funcion plantilla pipe memoizar pura metodo',
	'directives-templates/repeat-pipe': 'repetir bucle veces rango numero',
	'directives-templates/repeat': 'repetir bucle veces rango numero',
	'directives-templates/svg-sprites': 'svg sprite icono simbolo',
	'directives-templates/trackby-id-prop':
		'trackby id propiedad rendimiento lista',
	'dependency-injection/assert-injector': 'contexto inyeccion injector error',
	'dependency-injection/create-injectable':
		'servicio funcion injectable proveedor sin clase',
	'dependency-injection/create-injection-token':
		'token inyeccion proveer factory',
	'dependency-injection/inject-destroy':
		'destruir ondestroy desuscribir ciclo vida',
	'dependency-injection/inject-lazy':
		'perezoso cargar servicio import dinamico',
	'dependency-injection/singleton-proxy':
		'singleton perezoso instancia proxy clase',
	'http/merge-http-context': 'contexto http interceptor combinar',
	'intl/intl':
		'formato fecha numero moneda lista plural tiempo relativo idioma',
	'testing/testing': 'prueba pruebas test componente dom ayuda',
	'migrations/host-binding-migration':
		'migrar hostbinding hostlistener host schematic actualizar',
	'migrations/sfc-migration':
		'migrar plantilla estilos componente archivo schematic',
};

/** Real problems, each answered by a utility on this site (none point to deprecated utilities). */
export const examples = {
	en: [
		'read a query param as a signal',
		'close a menu on outside click',
		'undo and redo a signal',
		'pause polling while the tab is hidden',
		'keep a signal in localStorage',
		'effect with explicit dependencies',
	],
	es: [
		'leer un query param como signal',
		'cerrar un menú al hacer clic fuera',
		'deshacer y rehacer un signal',
		'pausar el polling con la pestaña oculta',
		'guardar un signal en localStorage',
		'effect con dependencias explícitas',
	],
};
