import {
	CreateEffectOptions,
	EffectCleanupRegisterFn,
	EffectRef,
	Signal,
	effect,
	untracked,
} from '@angular/core';

export function explicitEffect(
	effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
	deps: Signal<unknown>[],
	options?: CreateEffectOptions | undefined,
): EffectRef {
	return effect((onCleanup) => {
		// register the producers
		deps.forEach((dep) => dep());

		untracked(() => effectFn(onCleanup));
	}, options);
}
