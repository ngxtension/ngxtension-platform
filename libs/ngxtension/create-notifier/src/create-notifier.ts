import { signal } from '@angular/core';

/**
 * Creates a signal notifier that can be used to notify effects or other consumers.
 *
 * @returns A notifier object.
 */
export function createNotifier() {
	const sourceSignal = signal(0);

	return {
		notify: () => {
			sourceSignal.update((v) => (v >>> 0) + 1);
		},
		listen: sourceSignal.asReadonly(),
	};
}
