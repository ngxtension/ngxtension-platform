import {
	CreateEffectOptions,
	effect,
	EffectCleanupRegisterFn,
	EffectRef,
	runInInjectionContext,
	untracked,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

export function effectOnceIf<T = any>(
	condition: () => T,
	execution: (
		valueFromCondition: NonNullable<T>,
		onCleanup: EffectCleanupRegisterFn,
	) => void,
	options?: Omit<CreateEffectOptions, 'allowSignalWrites' | 'manualCleanup'>,
): EffectRef {
	const assertedInjector = assertInjector(effectOnceIf, options?.injector);
	return runInInjectionContext(assertedInjector, () => {
		const effectRef = effect((onCleanup) => {
			const hasCondition = condition();
			if (hasCondition) {
				untracked(() => execution(hasCondition, onCleanup));
				effectRef.destroy();
			}
		}, options);
		return effectRef;
	});
}

export type EffectOnceIfConditionFn<T> = Parameters<typeof effectOnceIf<T>>[0];
export type EffectOnceIfExecutionFn<T> = Parameters<typeof effectOnceIf<T>>[1];
export type EffectOnceIfOptions<T> = Parameters<typeof effectOnceIf<T>>[2];
