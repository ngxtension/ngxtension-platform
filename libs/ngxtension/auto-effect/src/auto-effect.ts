import {
	Injector,
	effect,
	inject,
	type CreateEffectOptions,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

export function injectAutoEffect(injector?: Injector) {
	return assertInjector(injectAutoEffect, injector, () => {
		const assertedInjector = inject(Injector);
		const injectorOptions = { injector: assertedInjector };
		return (
			autoEffectCallback: (autoEffectInjector: Injector) => void | (() => void),
			options: Omit<CreateEffectOptions, 'injector'> = {},
		) => {
			return effect(
				(onCleanup) => {
					const maybeCleanup = autoEffectCallback(assertedInjector);
					if (typeof maybeCleanup === 'function') {
						onCleanup(() => maybeCleanup());
					}
				},
				Object.assign(options, injectorOptions),
			);
		};
	});
}
