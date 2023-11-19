import type { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	identity,
	Observable,
	Subscription,
	tap,
	type TapObserver,
} from 'rxjs';

type Effect<T> = Partial<TapObserver<T>> | ((value: T) => void);
type RxEffectOptions = { destroyRef: DestroyRef };

export function rxEffect<T>(
	source: Observable<T>,
	effect: Effect<T>,
	options?: RxEffectOptions
): Subscription;
export function rxEffect<T>(
	source: Observable<T>,
	options?: RxEffectOptions
): Subscription;
export function rxEffect<T>(
	source: Observable<T>,
	effectOrOptions?: Effect<T> | RxEffectOptions,
	options?: RxEffectOptions
) {
	const effect =
		effectOrOptions && 'destroyRef' in effectOrOptions
			? undefined
			: effectOrOptions;

	options ??= effect ? options : (effectOrOptions as RxEffectOptions);

	return source
		.pipe(
			effect ? tap(effect) : identity,
			takeUntilDestroyed(options?.destroyRef)
		)
		.subscribe();
}
