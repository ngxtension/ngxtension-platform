import { effect, signal, type WritableSignal } from '@angular/core';

export type LocalStorageOptions<T> = {
	defaultValue?: T | (() => T);
	storageSync?: boolean;
	stringify?: (value: unknown) => string;
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
