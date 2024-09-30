import {
	DestroyRef,
	InjectionToken,
	effect,
	inject,
	signal,
	type Injector,
	type WritableSignal,
} from '@angular/core';
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
export type LocalStorageOptionsNoDefault = {
	/**
	 *
	 * Determines if local storage syncs with the signal.
	 * When true, updates in one tab reflect in others, ideal for shared-state apps.
	 * Defaults to true.
	 */
	storageSync?: boolean;
	/**
	 * Override the default JSON.stringify function for custom serialization.
	 * @param value
	 */
	stringify?: (value: unknown) => string;
	/**
	 * Override the default JSON.parse function for custom deserialization.
	 * @param value
	 */
	parse?: (value: string) => unknown;

	/**
	 * Injector for the Injection Context
	 */
	injector?: Injector;
};

export type LocalStorageOptionsWithDefaultValue<T> =
	LocalStorageOptionsNoDefault & {
		/**
		 * Default value for the signal.
		 * Can be a value or a function that returns the value.
		 */
		defaultValue: T | (() => T);
	};

export type LocalStorageOptions<T> =
	| LocalStorageOptionsNoDefault
	| LocalStorageOptionsWithDefaultValue<T>;

function isLocalStorageWithDefaultValue<T>(
	options: LocalStorageOptions<T>,
): options is LocalStorageOptionsWithDefaultValue<T> {
	return 'defaultValue' in options;
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
	return typeof value === 'function';
}

function goodTry<T>(tryFn: () => T): T | undefined {
	try {
		return tryFn();
	} catch {
		return undefined;
	}
}

function parseJSON(value: string): unknown {
	return value === 'undefined' ? undefined : JSON.parse(value);
}

export const injectLocalStorage: {
	<T>(
		key: string,
		options: LocalStorageOptionsWithDefaultValue<T>,
	): WritableSignal<T>;
	<T>(
		key: string,
		options?: LocalStorageOptionsNoDefault,
	): WritableSignal<T | undefined>;
} = <T>(
	key: string,
	options: LocalStorageOptions<T> = {},
): WritableSignal<T | undefined> => {
	if (isLocalStorageWithDefaultValue(options)) {
		const defaultValue = isFunction(options.defaultValue)
			? options.defaultValue()
			: options.defaultValue;

		return internalInjectLocalStorage<T>(key, options, defaultValue);
	}
	return internalInjectLocalStorage<T | undefined>(key, options, undefined);
};

const internalInjectLocalStorage = <R>(
	key: string,
	options: LocalStorageOptions<R>,
	defaultValue: R,
): WritableSignal<R> => {
	const stringify = isFunction(options.stringify)
		? options.stringify
		: JSON.stringify;
	const parse = isFunction(options.parse) ? options.parse : parseJSON;
	const storageSync = options.storageSync ?? true;
	return assertInjector(injectLocalStorage, options.injector, () => {
		const localStorage = inject(NGXTENSION_LOCAL_STORAGE);
		const destroyRef = inject(DestroyRef);

		const initialStoredValue = goodTry(() => localStorage.getItem(key));
		const initialValue = initialStoredValue
			? goodTry(() => parse(initialStoredValue) as R) ?? defaultValue
			: defaultValue;
		const internalSignal = signal(initialValue);

		effect(() => {
			const value = internalSignal();
			if (value === undefined) {
				goodTry(() => localStorage.removeItem(key));
			} else {
				goodTry(() => localStorage.setItem(key, stringify(value)));
			}
		});

		if (storageSync) {
			const onStorage = (event: StorageEvent) => {
				if (event.storageArea === localStorage && event.key === key) {
					const newValue =
						event.newValue !== null
							? (parse(event.newValue) as R)
							: defaultValue;
					internalSignal.set(newValue);
				}
			};

			window.addEventListener('storage', onStorage);
			destroyRef.onDestroy(() => {
				window.removeEventListener('storage', onStorage);
			});
		}

		return internalSignal;
	});
};
