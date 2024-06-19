import { signal } from '@angular/core';

export function createNotifier() {
	const sourceSignal = signal(0);

	return {
		notify: () => {
			sourceSignal.update((v) => (v >>> 0) + 1);
		},
		listen: sourceSignal.asReadonly(),
	};
}
