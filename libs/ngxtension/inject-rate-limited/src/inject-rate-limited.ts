import {
	inject,
	InjectionToken,
	Injector,
	signal,
	WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	asyncScheduler,
	auditTime,
	debounceTime,
	sampleTime,
	Subject,
	ThrottleConfig,
	throttleTime,
} from 'rxjs';

const NGXTENSION_RATE_LIMIT = new InjectionToken('NGXTENSION_RATE_LIMIT', {
	providedIn: 'root',
	factory: () => 200,
});

export type RateLimitedSignal<T> = Pick<WritableSignal<T>, 'set' | 'update'>;

export interface RateLimitedSignalOptions {
	/**
	 * Time window in milliseconds used by the operator.
	 * Defaults to the NGXTENSION_RATE_LIMIT injection token.
	 */
	durationMs?: number;

	/**
	 * RxJS operator used to rate-limit updates.
	 * @default debounceTime
	 */
	operator?:
		| typeof debounceTime
		| typeof throttleTime
		| typeof sampleTime
		| typeof auditTime;

	/**
	 * Optional injector override.
	 */
	injector?: Injector;

	/**
	 * Configuration for `throttleTime`, if used.
	 * @default { leading: true, trailing: false }
	 */
	config?: ThrottleConfig;
}

/**
 * Creates a signal that buffers and emits updates using a rate-limiting RxJS operator.
 */
export function injectRateLimited<T>(
	initialValue: T,
	options: RateLimitedSignalOptions = {},
): RateLimitedSignal<T> {
	return assertInjector(injectRateLimited, options?.injector, () => {
		const defaultRateLimit = inject(NGXTENSION_RATE_LIMIT);

		const {
			durationMs: delayMs = defaultRateLimit,
			operator = debounceTime,
			config = {
				leading: true,
				trailing: false,
			},
		} = options;

		const subject = new Subject<T>();
		const inner = signal<T>(initialValue);

		const stream = subject.pipe(operator(delayMs, asyncScheduler, config));

		stream.pipe(takeUntilDestroyed()).subscribe((value) => inner.set(value));

		return new Proxy(inner, {
			get(target, prop, receiver) {
				switch (prop) {
					case 'set':
						return (value: T) => subject.next(value);
					case 'update':
						return (updater: (value: T) => T) => {
							const nextValue = updater(inner());
							subject.next(nextValue);
						};
					default:
						return Reflect.get(target, prop, receiver);
				}
			},
		});
	});
}
