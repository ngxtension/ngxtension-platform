import type { CreateComputedOptions } from '@angular/core';
import { computed as ngComputed } from '@angular/core';

/**
 * @deprecated Use `linkedSignal`. Will be removed in v5
 * @since v4
 */
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

/**
 * @deprecated Use `linkedSignal`. Will be removed in v5
 * @since v4
 */
export const extendedComputed = computed;
