import {
	effect,
	inject,
	InjectionToken,
	signal,
	type WritableSignal,
} from '@angular/core';

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
export type LocalStorageOptions<T> = {
	/**
	 * The default value to use when the key is not present in local storage.
	 */
	defaultValue?: T | (() => T);
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
};

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

export const injectLocalStorage = <T>(
	key: string,
	options?: LocalStorageOptions<T>,
): WritableSignal<T | undefined> => {
	const defaultValue = isFunction(options?.defaultValue)
		? options.defaultValue()
		: options?.defaultValue;
	const stringify = isFunction(options?.stringify)
		? options?.stringify
		: JSON.stringify;
	const parse = isFunction(options?.parse) ? options?.parse : parseJSON;

	const storageSync = options?.storageSync ?? true;

	const localStorage = inject(NGXTENSION_LOCAL_STORAGE);

	const initialStoredValue = goodTry(() => localStorage.getItem(key));
	const initialValue = initialStoredValue
		? goodTry(() => parse(initialStoredValue) as T)
		: defaultValue;
	const internalSignal = signal<T | undefined>(initialValue);

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
					event.newValue !== null ? (parse(event.newValue) as T) : undefined;
				internalSignal.set(newValue);
			}
		};
		window.addEventListener('storage', onStorage);
		effect((onCleanup) => {
			onCleanup(() => window.removeEventListener('storage', onStorage));
		});
	}

	return internalSignal;
};
