import {
	Injector,
	WritableSignal,
	runInInjectionContext,
	signal,
	untracked,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { createInjectionToken } from 'ngxtension/create-injection-token';
import { toDeepSignal, type DeepSignal } from './deep-signal';
import { defaultEqualityFn } from './select-signal';

export type SignalStore<State extends Record<string, unknown>> =
	DeepSignal<State> & SignalStoreUpdate<State> & SignalStoreSnapshot<State>;

export type SignalStoreSnapshot<State extends Record<string, unknown>> = {
	snapshot: State;
};

export type SignalStoreUpdater<State extends Record<string, unknown>> =
	| Partial<State>
	| ((state: State) => Partial<State>);

export type SignalStoreUpdate<State extends Record<string, unknown>> = {
	set: (...updaters: SignalStoreUpdater<State>[]) => void;
	patch: (state: Partial<State>) => void;
};

export type SignalStoreApi<State extends Record<string, unknown>> =
	SignalStoreUpdate<State> & SignalStoreSnapshot<State>;

export const [injectUseUntracked, provideUseUntracked] = createInjectionToken(
	() => false
);

export function signalStoreInjector(useUntracked = false) {
	return Injector.create({ providers: [provideUseUntracked(useUntracked)] });
}

/**
 * Signal state cannot contain optional properties.
 */
export type NotAllowedStateCheck<State> = State extends Required<State>
	? State extends Record<string, unknown>
		? { [K in keyof State]: State[K] & NotAllowedStateCheck<State[K]> }
		: unknown
	: never;

export function signalStore<State extends Record<string, unknown>>(
	initialState:
		| (State & NotAllowedStateCheck<State>)
		| ((
				storeApi: SignalStoreApi<State>
		  ) => State & NotAllowedStateCheck<State>),
	injector?: Injector
): SignalStore<State> {
	injector = assertInjector(signalStore, injector);
	return runInInjectionContext(injector, () => {
		const useUntracked = injectUseUntracked({ optional: true }) ?? false;

		let source: WritableSignal<State>;
		let set: SignalStoreUpdate<State>['set'];
		let patch: SignalStoreUpdate<State>['patch'];

		if (typeof initialState === 'function') {
			source = signal({} as State, { equal: defaultEqualityFn });
			set = setFactory(source, useUntracked);
			patch = patchFactory(source, useUntracked);

			const api = { set, patch } as SignalStoreApi<State>;

			Object.defineProperty(api, 'snapshot', {
				get: snapshotFactory(source, useUntracked),
				configurable: false,
			});

			source.set(initialState(api));
		} else {
			source = signal(initialState, { equal: defaultEqualityFn });
			set = setFactory(source, useUntracked);
			patch = patchFactory(source, useUntracked);
		}

		const deepSource = toDeepSignal(source.asReadonly());
		Object.assign(deepSource, { set, patch });
		Object.defineProperty(deepSource, 'snapshot', {
			get: snapshotFactory(source, useUntracked),
			configurable: false,
		});

		return deepSource as SignalStore<State>;
	});
}

function snapshotFactory<State extends Record<string, unknown>>(
	_source: WritableSignal<State>,
	useUntracked = false
) {
	if (useUntracked) {
		return () => untracked(_source);
	}
	return _source.asReadonly();
}

function setFactory<State extends Record<string, unknown>>(
	_source: WritableSignal<State>,
	useUntracked = false
): SignalStoreUpdate<State>['set'] {
	return (...updaters) => {
		const _updater = (previous: State) => {
			return updaters.reduce((acc: State, updater) => {
				const partial = typeof updater === 'function' ? updater(acc) : updater;

				Object.keys(partial).forEach((key) => {
					const typedKey = key as keyof State;
					if (partial[typedKey] === undefined && acc[typedKey] != null) {
						partial[typedKey] = acc[typedKey];
					}
				});

				return partial as State;
			}, previous);
		};

		if (useUntracked) {
			untracked(() => {
				_source.update((previous) => ({ ...previous, ..._updater(previous) }));
			});
		} else {
			_source.update((previous) => ({ ...previous, ..._updater(previous) }));
		}
	};
}

function patchFactory<State extends Record<string, unknown>>(
	_source: WritableSignal<State>,
	useUntracked = false
): SignalStoreUpdate<State>['patch'] {
	return (state: Partial<State>) => {
		const updater = (previous: State) => {
			Object.keys(state).forEach((key) => {
				const typedKey = key as keyof State;
				if (state[typedKey] === undefined && previous[typedKey] != null) {
					state[typedKey] = previous[typedKey];
				}
			});
			return state;
		};
		if (useUntracked) {
			untracked(() => {
				_source.update((previous) => ({ ...updater(previous), ...previous }));
			});
		} else {
			_source.update((previous) => ({ ...updater(previous), ...previous }));
		}
	};
}
