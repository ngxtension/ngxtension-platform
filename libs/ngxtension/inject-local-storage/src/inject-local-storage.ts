import { DOCUMENT } from '@angular/common';
import {
	computed,
	DestroyRef,
	inject,
	InjectionToken,
	type Injector,
	Signal,
	signal,
	untracked,
	type WritableSignal,
} from '@angular/core';
import { SIGNAL, SignalNode } from '@angular/core/primitives/signals';
import { assertInjector } from 'ngxtension/assert-injector';

export const NGXTENSION_LOCAL_STORAGE = new InjectionToken(
	'NGXTENSION_LOCAL_STORAGE',
	{
		providedIn: 'root',
		factory: () => localStorage, // this would be the default
	},
);

export function provideLocalStorageImpl(impl: typeof globalThis.localStorage) {
	return {
		provide: NGXTENSION_LOCAL_STORAGE,
		useValue: impl,
	};
}

/**
 * Options to override the default behavior of the local storage signal.
 */
export type LocalStorageOptionsBase<T> = {
	/**
	 * Determines if local storage syncs with the signal.
	 * When true, updates in one tab reflect in others, ideal for shared-state apps.
	 * @default true
	 */
	storageSync?: boolean;
	/**
	 * Override the default JSON.stringify function for custom serialization.
	 * @param value
	 */
	stringify?: (value: T) => string;
	/**
	 * Override the default JSON.parse function for custom deserialization.
	 * @param value
	 */
	parse?: (value: string) => T;

	/**
	 * Injector for the Injection Context
	 */
	injector?: Injector;
};

export type LocalStorageOptionsNoDefault<T> = LocalStorageOptionsBase<T>;

export type LocalStorageOptionsWithDefaultValue<T> =
	LocalStorageOptionsNoDefault<T> & {
		/**
		 * Default value for the signal.
		 * Can be a value or a function that returns the value.
		 */
		defaultValue: T | (() => T);
	};

type ClearOnKeyChange = {
	/**
	 * Specifies whether the value stored under the previous key
	 * should be removed from `localStorage` when the key changes.
	 * @default true
	 */
	clearOnKeyChange?: boolean;
};

export type LocalStorageOptionsComputedNoDefault<T> =
	LocalStorageOptionsBase<T> & ClearOnKeyChange;

export type LocalStorageOptionsComputedWithDefaultValue<T> =
	LocalStorageOptionsWithDefaultValue<T> & ClearOnKeyChange;

export type LocalStorageOptions<T> =
	| LocalStorageOptionsNoDefault<T>
	| LocalStorageOptionsWithDefaultValue<T>
	| LocalStorageOptionsComputedNoDefault<T>
	| LocalStorageOptionsComputedWithDefaultValue<T>;

function patch<K extends keyof any, V>(
	target: any,
	key: K,
	value: V,
): asserts target is Record<K, V> {
	target[key] = value;
}

enum Kind {
	INITIAL,
	COMPUTED,
}

interface InitialState {
	kind: Kind.INITIAL;
	key: null;
	value: null;
}

interface ComputedState<T> {
	kind: Kind.COMPUTED;
	key: string;
	value: T;
}

type State<T> = InitialState | ComputedState<T>;

type LocalStorageSignal<T> = Signal<T> &
	Pick<WritableSignal<T>, 'set' | 'update' | 'asReadonly'>;

function isLocalStorageWithDefaultValue<T>(
	options: LocalStorageOptions<T>,
): options is LocalStorageOptionsWithDefaultValue<T> {
	return 'defaultValue' in options;
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
	return typeof value === 'function';
}

function goodTry<T>(tryFn: () => T, defaultValue: T): T {
	try {
		return tryFn();
	} catch {
		return defaultValue;
	}
}

function parseJSON(value: string): unknown {
	return value === 'undefined' ? undefined : JSON.parse(value);
}

export const injectLocalStorage: {
	<T>(
		key: string,
		options: LocalStorageOptionsWithDefaultValue<T>,
	): LocalStorageSignal<T>;
	<T>(
		key: string,
		options?: LocalStorageOptionsNoDefault<T>,
	): LocalStorageSignal<T | undefined>;
	<T>(
		keyComputation: () => string,
		options: LocalStorageOptionsComputedWithDefaultValue<T>,
	): LocalStorageSignal<T>;
	<T>(
		keyComputation: () => string,
		options?: LocalStorageOptionsComputedNoDefault<T>,
	): LocalStorageSignal<T | undefined>;
} = <T>(
	keyOrComputation: string | (() => string),
	options: LocalStorageOptions<T> = {},
): LocalStorageSignal<T | undefined> => {
	if (isLocalStorageWithDefaultValue(options)) {
		const defaultValue = isFunction(options.defaultValue)
			? options.defaultValue()
			: options.defaultValue;

		return internalInjectLocalStorage<T>(
			keyOrComputation,
			options,
			defaultValue,
		);
	}
	return internalInjectLocalStorage<T, T | undefined>(
		keyOrComputation,
		options,
		undefined,
	);
};

const internalInjectLocalStorage = <T, R = T>(
	keyOrComputation: string | (() => string),
	options: LocalStorageOptions<T>,
	defaultValue: R,
): LocalStorageSignal<R> => {
	const stringify = isFunction(options.stringify)
		? options.stringify
		: JSON.stringify;
	const parse = isFunction(options.parse) ? options.parse : parseJSON;
	const storageSync = options.storageSync ?? true;
	const clearOnKeyChange =
		'clearOnKeyChange' in options ? (options.clearOnKeyChange ?? true) : true;

	return assertInjector(injectLocalStorage, options.injector, () => {
		const localStorage = inject(NGXTENSION_LOCAL_STORAGE);
		const destroyRef = inject(DestroyRef);
		const window = inject(DOCUMENT).defaultView;

		if (!window) {
			throw new Error('Cannot access to window element');
		}

		const computedKey = computed(() =>
			typeof keyOrComputation === 'string'
				? keyOrComputation
				: keyOrComputation(),
		);

		const state = signal<State<R>>(
			{
				kind: Kind.INITIAL,
				key: null,
				value: null,
			},
			{
				equal: (a, b) => a.kind === b.kind && a.value === b.value,
			},
		);

		const getInitialValue = (key: string) => {
			const initialStoredValue = goodTry(() => localStorage.getItem(key), null);

			return initialStoredValue
				? goodTry(() => parse(initialStoredValue) as R, defaultValue)
				: defaultValue;
		};

		const internalSignal = computed<R>(() => {
			const key = computedKey();

			untracked(() => {
				const { kind, key: prevKey } = state();
				if (kind === Kind.INITIAL || prevKey !== key) {
					if (clearOnKeyChange && kind === Kind.COMPUTED) {
						try {
							localStorage.removeItem(prevKey);
						} catch {
							/* ignore */
						}
					}

					state.set({
						kind: Kind.COMPUTED,
						key,
						value: getInitialValue(key),
					});
				}
			});

			const { kind, value } = state();

			if (kind === Kind.COMPUTED) {
				return value;
			}

			throw new Error('Cannot access to the value');
		});

		const syncValueWithLocalStorage = (value: R): void => {
			if (!storageSync) {
				return;
			}

			const key = untracked(computedKey);
			const newValue = goodTry(
				() => (value === undefined ? null : stringify(value)),
				null,
			);

			try {
				if (newValue === localStorage.getItem(key)) {
					return;
				}

				if (newValue === null) {
					localStorage.removeItem(key);
				} else {
					localStorage.setItem(key, newValue);
				}

				// We notify other consumers in this tab about changing the value in the store for synchronization
				window.dispatchEvent(
					new StorageEvent(`storage`, {
						key,
						newValue,
						storageArea: localStorage,
					}),
				);
			} catch {
				// ignore errors
			}
		};

		if (storageSync) {
			const onStorage = (event: StorageEvent) => {
				const key = untracked(computedKey);

				if (event.storageArea === localStorage && event.key === key) {
					const newValue =
						event.newValue !== null
							? (parse(event.newValue) as R)
							: defaultValue;
					state.set({
						kind: Kind.COMPUTED,
						key,
						value: newValue,
					});
				}
			};

			window.addEventListener('storage', onStorage);
			destroyRef.onDestroy(() => {
				window.removeEventListener('storage', onStorage);
			});
		}

		const set: WritableSignal<R>['set'] = (newValue: R) => {
			const { kind, key } = untracked(state);
			let newKey: string;

			switch (kind) {
				case Kind.INITIAL: {
					newKey = untracked(computedKey);
					break;
				}
				case Kind.COMPUTED: {
					newKey = key;
					break;
				}
			}

			// set the value in the signal using the original set function
			state.set({
				kind: Kind.COMPUTED,
				key: newKey,
				value: newValue,
			});

			// then we refresh the value in localStorage and notify other consumers in this tab about the change
			syncValueWithLocalStorage(newValue);
		};

		const update: WritableSignal<R>['update'] = (updateFn: (value: R) => R) => {
			// set the value in the signal using the original set function
			state.update(({ kind, key, value }) => {
				let newValue: R;
				let newKey: string;

				switch (kind) {
					case Kind.INITIAL: {
						newKey = untracked(computedKey);
						newValue = updateFn(getInitialValue(newKey));
						break;
					}
					case Kind.COMPUTED: {
						newKey = key;
						newValue = updateFn(value);
						break;
					}
				}

				// then we refresh the value in localStorage and notify other consumers in this tab about the change
				syncValueWithLocalStorage(newValue);

				return {
					kind: Kind.COMPUTED,
					key: newKey,
					value: newValue,
				};
			});
		};

		patch(internalSignal, 'set', set);
		patch(internalSignal, 'update', update);
		// TODO replace with linkedSignal after upgrade to Angular 19
		patch(
			internalSignal,
			'asReadonly',
			function signalAsReadonlyFn(this: typeof internalSignal) {
				const node = this[SIGNAL] as SignalNode<R> & {
					readonlyFn?: Signal<R>;
				};

				if (node.readonlyFn === undefined) {
					const readonlyFn = () => this();
					readonlyFn[SIGNAL] = node;
					node.readonlyFn = readonlyFn;
				}

				return node.readonlyFn;
			},
		);

		return internalSignal;
	});
};
