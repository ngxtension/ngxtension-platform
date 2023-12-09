import type { CreateComputedOptions } from '@angular/core';
import { computed as ngComputed } from '@angular/core';

export function computed<TValue>(
	computedCallback: (currentValue: TValue) => TValue,
	options?: CreateComputedOptions<TValue>,
) {
	if (!options) {
		options = { equal: Object.is };
	}

	let currentValue: TValue = undefined!;
	return ngComputed(() => {
		return (currentValue = computedCallback(currentValue));
	}, options);
}

export const extendedComputed = computed;
