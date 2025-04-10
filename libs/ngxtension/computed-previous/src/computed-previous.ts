import { computed, CreateComputedOptions, type Signal } from '@angular/core';

enum Kind {
	INITIAL,
	COMPUTED,
}

interface InitialState {
	kind: Kind.INITIAL;
	previousValue: null;
	currentValue: null;
}

interface ComputedState<T> {
	kind: Kind.COMPUTED;
	previousValue: T;
	currentValue: T;
}

type State<T> = InitialState | ComputedState<T>;

/**
 * Creates a computed signal that tracks the previous value produced by the given computation.
 *
 * The first time the computed signal is evaluated, the returned signal emits the same value
 * as the current computation result. On subsequent evaluations, it emits the value from the prior update.
 *
 * @example
 * ```ts
 * const value = signal(0);
 * const previous = computedPrevious(value);
 *
 * effect(() => {
 *   console.log('Current value:', value());
 *   console.log('Previous value:', previous());
 * });
 *
 * // Logs initially:
 * // Current value: 0
 * // Previous value: 0
 *
 * value.set(1);
 *
 * // Logs:
 * // Current value: 1
 * // Previous value: 0
 *
 * value.set(2);
 *
 * // Logs:
 * // Current value: 2
 * // Previous value: 1
 * ```
 *
 * @param computation A function that returns the current value. Typically, this is a signal accessor.
 * @param options Optional computed signal configuration.
 * @returns A signal that emits the previous value returned by the computation.
 */
export function computedPrevious<T>(
	computation: () => T,
	options?: CreateComputedOptions<T>,
): Signal<T> {
	let state: State<T> = {
		kind: Kind.INITIAL,
		previousValue: null,
		currentValue: null,
	};

	return computed(() => {
		const currentValue = computation();

		if (state.kind === Kind.INITIAL) {
			state = {
				kind: Kind.COMPUTED,
				previousValue: currentValue,
				currentValue,
			};
		}

		state.previousValue = state.currentValue;
		state.currentValue = currentValue;

		return state.previousValue;
	}, options);
}
