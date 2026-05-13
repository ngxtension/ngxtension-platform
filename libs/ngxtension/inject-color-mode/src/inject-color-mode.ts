import { DOCUMENT } from '@angular/common';
import {
	computed,
	DestroyRef,
	effect,
	inject,
	type Injector,
	type Signal,
	signal,
	untracked,
	type WritableSignal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectLocalStorage } from 'ngxtension/inject-local-storage';

export type BasicColorMode = 'light' | 'dark';
export type BasicColorSchema = BasicColorMode | 'auto';

/**
 * Options for injectColorMode
 */
export interface InjectColorModeOptions<T extends string = BasicColorMode> {
	/**
	 * CSS Selector for the target element applying to
	 *
	 * @default 'html'
	 */
	selector?: string;

	/**
	 * HTML attribute applying the target element
	 *
	 * @default 'class'
	 */
	attribute?: string;

	/**
	 * The initial color mode
	 *
	 * @default 'auto'
	 */
	initialValue?: T | BasicColorSchema;

	/**
	 * Prefix when adding value to the attribute
	 */
	modes?: Partial<Record<T | BasicColorSchema, string>>;

	/**
	 * A custom handler for handle the updates.
	 * When specified, the default behavior will be overridden.
	 *
	 * @default undefined
	 */
	onChanged?: (
		mode: T | BasicColorMode,
		defaultHandler: (mode: T | BasicColorMode) => void,
	) => void;

	/**
	 * Key to persist the data into localStorage.
	 *
	 * Pass `null` to disable persistence
	 *
	 * @default 'ngxtension-color-scheme'
	 */
	storageKey?: string | null;

	/**
	 * Determines if local storage syncs with the signal.
	 * When true, updates in one tab reflect in others.
	 *
	 * @default true
	 */
	storageSync?: boolean;

	/**
	 * Disable transition on switch
	 *
	 * @see https://paco.me/writing/disable-theme-transitions
	 * @default true
	 */
	disableTransition?: boolean;

	/**
	 * Injector for the Injection Context
	 */
	injector?: Injector;
}

/**
 * Return type for injectColorMode
 */
export interface InjectColorModeReturn<T extends string = BasicColorMode> {
	/**
	 * The current color mode (resolves 'auto' to 'light' or 'dark')
	 */
	mode: WritableSignal<T | BasicColorSchema>;

	/**
	 * The stored value (can be 'auto')
	 */
	store: Signal<T | BasicColorSchema>;

	/**
	 * The system preference ('light' or 'dark')
	 */
	system: Signal<BasicColorMode>;

	/**
	 * The resolved state (never 'auto', always 'light' or 'dark')
	 */
	state: Signal<T | BasicColorMode>;
}

const CSS_DISABLE_TRANS =
	'*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}';

/**
 * Creates a signal for managing prefers-color-scheme media query
 */
function injectPreferredDark(injector?: Injector): Signal<boolean> {
	return assertInjector(injectPreferredDark, injector, () => {
		const document = inject(DOCUMENT);
		const window = document.defaultView;

		if (!window) {
			return signal(false);
		}

		const prefersDark = signal(false);
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		// Set initial value
		prefersDark.set(mediaQuery.matches);

		// Listen for changes
		const listener = (e: MediaQueryListEvent) => {
			prefersDark.set(e.matches);
		};

		mediaQuery.addEventListener('change', listener);

		const destroyRef = inject(DestroyRef);
		destroyRef.onDestroy(() => {
			mediaQuery.removeEventListener('change', listener);
		});

		return prefersDark.asReadonly();
	});
}

/**
 * Reactive color mode with auto data persistence.
 *
 * @example
 * ```ts
 * const colorMode = injectColorMode();
 * // Read the current mode
 * console.log(colorMode.mode()); // 'dark' | 'light'
 *
 * // Change mode
 * colorMode.mode.set('dark');
 * colorMode.mode.set('auto'); // Use system preference
 *
 * // Access system preference
 * console.log(colorMode.system()); // 'dark' | 'light'
 *
 * // Access stored value (includes 'auto')
 * console.log(colorMode.store()); // 'dark' | 'light' | 'auto'
 *
 * // Access resolved state (never 'auto')
 * console.log(colorMode.state()); // 'dark' | 'light'
 * ```
 *
 * @param options Configuration options
 * @returns An object with mode, store, system, and state signals
 */
export function injectColorMode<T extends string = BasicColorMode>(
	options: InjectColorModeOptions<T> = {},
): InjectColorModeReturn<T> {
	const {
		selector = 'html',
		attribute = 'class',
		initialValue = 'auto' as T | BasicColorSchema,
		storageKey = 'ngxtension-color-scheme',
		storageSync = true,
		disableTransition = true,
		injector,
	} = options;

	return assertInjector(injectColorMode, injector, () => {
		const document = inject(DOCUMENT);
		const window = document.defaultView;

		if (!window) {
			throw new Error('Cannot access window element');
		}

		const modes = {
			auto: '',
			light: 'light',
			dark: 'dark',
			...(options.modes || {}),
		} as Record<BasicColorSchema | T, string>;

		// Get system preference
		const preferredDark = injectPreferredDark(injector);
		const system = computed(() => (preferredDark() ? 'dark' : 'light'));

		// Get or create storage
		const store: WritableSignal<T | BasicColorSchema> =
			storageKey === null
				? signal(initialValue)
				: injectLocalStorage<T | BasicColorSchema>(storageKey, {
						defaultValue: initialValue,
						storageSync,
						injector,
					});

		// Computed state that resolves 'auto' to system preference
		const state = computed<T | BasicColorMode>(() =>
			store() === 'auto' ? system() : (store() as T | BasicColorMode),
		);

		// Update HTML attributes
		function updateHTMLAttrs(mode: T | BasicColorMode): void {
			const el =
				typeof selector === 'string'
					? window.document.querySelector(selector)
					: null;

			if (!el) {
				return;
			}

			const value = modes[mode] ?? mode;
			const classesToAdd = new Set<string>();
			const classesToRemove = new Set<string>();
			let attributeToChange: { key: string; value: string } | null = null;

			if (attribute === 'class') {
				const current = value.split(/\s/g);
				Object.values(modes)
					.flatMap((i) => (i || '').split(/\s/g))
					.filter(Boolean)
					.forEach((v) => {
						if (current.includes(v)) {
							classesToAdd.add(v);
						} else {
							classesToRemove.add(v);
						}
					});
			} else {
				attributeToChange = { key: attribute, value };
			}

			if (
				classesToAdd.size === 0 &&
				classesToRemove.size === 0 &&
				attributeToChange === null
			) {
				// Nothing changed so we can avoid reflowing the page
				return;
			}

			let style: HTMLStyleElement | undefined;
			if (disableTransition) {
				style = window.document.createElement('style');
				style.appendChild(document.createTextNode(CSS_DISABLE_TRANS));
				window.document.head.appendChild(style);
			}

			for (const c of classesToAdd) {
				el.classList.add(c);
			}
			for (const c of classesToRemove) {
				el.classList.remove(c);
			}
			if (attributeToChange) {
				el.setAttribute(attributeToChange.key, attributeToChange.value);
			}

			if (disableTransition) {
				// Calling getComputedStyle forces the browser to redraw
				const _ = window.getComputedStyle(style!).opacity;
				document.head.removeChild(style!);
			}
		}

		function defaultOnChanged(mode: T | BasicColorMode): void {
			updateHTMLAttrs(mode);
		}

		function onChanged(mode: T | BasicColorMode): void {
			if (options.onChanged) {
				options.onChanged(mode, defaultOnChanged);
			} else {
				defaultOnChanged(mode);
			}
		}

		// Watch for state changes and update HTML
		effect(() => {
			const currentState = state();
			untracked(() => onChanged(currentState));
		});

		// Return the store as mode (it's already a writable signal)
		return {
			mode: store,
			store: store.asReadonly(),
			system,
			state,
		};
	});
}
