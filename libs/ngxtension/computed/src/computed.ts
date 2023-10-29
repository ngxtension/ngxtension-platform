import type { CreateComputedOptions } from '@angular/core';
import { computed as ngComputed, signal, untracked } from '@angular/core';

export function computed<TValue>(
	computedCallback: (currentValue: TValue) => TValue,
	options?: CreateComputedOptions<TValue>
) {
	if (!options) {
		options = { equal: Object.is };
	}

	const currentValue = signal<TValue>(undefined!, { equal: Object.is });
	return ngComputed(() => {
		const computedValue = computedCallback(untracked(currentValue));
		untracked(() => {
			currentValue.set(computedValue);
		});
		return computedValue;
	}, options);
}

export const extendedComputed = computed;
