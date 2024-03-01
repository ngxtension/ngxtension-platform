import { computed, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
	catchError,
	distinctUntilChanged,
	fromEvent,
	merge,
	Observable,
	of,
	startWith,
	Subject,
} from 'rxjs';
import { map } from 'rxjs/operators';

export const useLocalStorage = <T>(
	key: string,
	validate?: (value: unknown) => boolean,
): {
	set: (value: T) => void;
	value: Signal<T | null | undefined>;
	error: Signal<Error | undefined>;
} => {
	const refresh$ = new Subject<void>();

	const externalLocalStorageChanges$: Observable<
		| { value: T | null }
		| {
				error: Error;
		  }
	> = merge(refresh$, fromEvent(window, 'storage')).pipe(
		startWith(null), // Trigger initialization
		map(() => localStorage.getItem(key)),
		distinctUntilChanged(), // The fromEvent(window, 'storage') will emit whenever any tab changes the local storage, so we try to filter out the events that are not relevant to this key
		map((stringValue) => {
			const value =
				stringValue === null ? null : (JSON.parse(stringValue) as T);
			if (validate && !validate(value)) {
				return { error: new Error('Invalid value') };
			}
			return { value };
		}),
		catchError((error) => of({ error })),
	);

	const initialState = toSignal(externalLocalStorageChanges$, {
		requireSync: true,
	});
	const value = computed(() => (initialState() as { value: T }).value);
	const error = computed(() => (initialState() as { error: Error }).error);

	const setLocalStorage = (value: T) => {
		window.localStorage.setItem(key, JSON.stringify(value));
		refresh$.next();
	};

	return {
		set: setLocalStorage,
		value: value,
		error: error,
	};
};
