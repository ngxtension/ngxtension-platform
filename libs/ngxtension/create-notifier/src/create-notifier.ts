import { linkedSignal, Signal } from '@angular/core';

type CreateNotifierOptions = Record<string, any> & {
	deps: Signal<any>[];
	depsEmitInitially?: boolean;
};

const DEFAULT_OPTIONS: Required<CreateNotifierOptions> = {
	deps: [],
	depsEmitInitially: true,
};

/**
 * Creates a signal notifier that can be used to notify effects or other consumers.
 *
 * @returns A notifier object.
 */
export function createNotifier(options?: CreateNotifierOptions) {
	options = {
		...DEFAULT_OPTIONS,
		...options,
	};

	const sourceSignal = linkedSignal<number, number>({
		source: () => {
			options?.deps?.forEach((dep) => dep()); // Track all dependencies

			// - when deps exist, the notifier should start at 1, because it immediately emits.
			//  -without any deps, it is only based on increments. and those should start at 0.
			return options?.deps?.length && options?.depsEmitInitially ? 1 : 0;
		},
		// Return a new value each time source runs. This ensures deps changes also increment the counter
		computation: (currentIncrementer, previousValue) => {
			// Increment from previous value when deps change
			return previousValue !== undefined
				? previousValue.value + 1
				: currentIncrementer;
		},
		equal: () => false, // Always notify downstream consumers
	});

	return {
		notify: () => sourceSignal.update((v) => (v >>> 0) + 1),
		listen: sourceSignal.asReadonly(),
	};
}
