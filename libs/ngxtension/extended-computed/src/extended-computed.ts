import type { CreateComputedOptions } from '@angular/core';
import { computed } from '@angular/core';

/**
 * @deprecated Use `linkedSignal`.
 * @since v4
 */
export function extendedComputed<TValue>(
	computedCallback: (currentValue: TValue) => TValue,
	options?: CreateComputedOptions<TValue>,
) {
	if (!options) {
		options = { equal: Object.is };
	}

	let currentValue: TValue = undefined!;
	return computed(() => {
		return (currentValue = computedCallback(currentValue));
	}, options);
}
