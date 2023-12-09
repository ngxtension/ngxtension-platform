import {
	DestroyRef,
	Injector,
	untracked,
	type WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { isObservable, Subscription, type Observable } from 'rxjs';

export type PartialOrValue<TValue> = TValue extends object
	? Partial<TValue>
	: TValue;
export type Reducer<TValue, TNext> = (
	previous: TValue,
	next: TNext,
) => PartialOrValue<TValue>;

type ConnectedSignal<TSignalValue> = {
	with<TObservableValue extends PartialOrValue<TSignalValue>>(
		observable: Observable<TObservableValue>,
	): ConnectedSignal<TSignalValue>;
	with<TObservableValue>(
		observable: Observable<TObservableValue>,
		reducer: Reducer<TSignalValue, TObservableValue>,
	): ConnectedSignal<TSignalValue>;
	subscription: Subscription;
};

/**
 * Connects a signal to an observable and returns a subscription. The subscription is automatically
 * unsubscribed when the component is destroyed. If it's not called in an injection context, it must
 * be called with an injector or DestroyRef.
 *
 *
 * Usage
 * ```ts
 * @Component({})
 * export class MyComponent {
 *  private dataService = inject(DataService);
 *
 *  data = signal([] as string[]);
 *
 *  constructor() {
 *    connect(this.data, this.dataService.data$);
 *  }
 * }
 * ```
 */
export function connect<TSignalValue>(
	signal: WritableSignal<TSignalValue>,
	injectorOrDestroyRef?: Injector | DestroyRef,
	useUntracked?: boolean,
): ConnectedSignal<TSignalValue>;
export function connect<
	TSignalValue,
	TObservableValue extends PartialOrValue<TSignalValue>,
>(
	signal: WritableSignal<TSignalValue>,
	observable: Observable<TObservableValue>,
	injectorOrDestroyRef?: Injector | DestroyRef,
	useUntracked?: boolean,
): Subscription;
export function connect<TSignalValue, TObservableValue>(
	signal: WritableSignal<TSignalValue>,
	observable: Observable<TObservableValue>,
	reducer: Reducer<TSignalValue, TObservableValue>,
	injectorOrDestroyRef?: Injector | DestroyRef,
	useUntracked?: boolean,
): Subscription;
export function connect(signal: WritableSignal<unknown>, ...args: any[]) {
	const [observable, reducer, injectorOrDestroyRef, useUntracked] =
		parseArgs(args);

	if (observable) {
		let destroyRef = null;

		if (injectorOrDestroyRef instanceof DestroyRef) {
			destroyRef = injectorOrDestroyRef; // if it's a DestroyRef, use it
		} else {
			const injector = assertInjector(connect, injectorOrDestroyRef);
			destroyRef = injector.get(DestroyRef);
		}

		return observable.pipe(takeUntilDestroyed(destroyRef)).subscribe((x) => {
			const update = () => {
				signal.update((prev) => {
					if (typeof prev === 'object' && !Array.isArray(prev)) {
						return { ...prev, ...((reducer?.(prev, x) || x) as object) };
					}

					return reducer?.(prev, x) || x;
				});
			};

			if (useUntracked) {
				untracked(update);
			} else {
				update();
			}
		});
	}

	return {
		with(this: ConnectedSignal<unknown>, ...args: unknown[]) {
			if (!this.subscription) {
				this.subscription = new Subscription();
			} else if (this.subscription.closed) {
				console.info(`[ngxtension connect] ConnectedSignal has been closed.`);
				return this;
			}
			this.subscription.add(
				connect(
					signal,
					...(args as any),
					injectorOrDestroyRef as any,
					useUntracked,
				) as unknown as Subscription,
			);
			return this;
		},
		subscription: null!,
	} as ConnectedSignal<unknown>;
}

// TODO: there must be a way to parse the args more efficiently
function parseArgs(
	args: any[],
): [
	Observable<unknown> | null,
	Reducer<unknown, unknown> | null,
	Injector | DestroyRef | null,
	boolean,
] {
	if (args.length > 3) {
		return [
			args[0] as Observable<unknown>,
			args[1] as Reducer<unknown, unknown>,
			args[2] as Injector | DestroyRef,
			args[3] as boolean,
		];
	}

	if (args.length === 3) {
		if (typeof args[2] === 'boolean') {
			return [
				args[0] as Observable<unknown>,
				null,
				args[1] as Injector | DestroyRef,
				args[2],
			];
		}

		return [
			args[0] as Observable<unknown>,
			args[1] as Reducer<unknown, unknown>,
			args[2] as Injector | DestroyRef,
			false,
		];
	}

	if (args.length === 2) {
		if (typeof args[1] === 'boolean') {
			return [null, null, args[0] as Injector | DestroyRef, args[1]];
		}

		if (typeof args[1] === 'function') {
			return [
				args[0] as Observable<unknown>,
				args[1] as Reducer<unknown, unknown>,
				null,
				false,
			];
		}

		return [
			args[0] as Observable<unknown>,
			null,
			args[1] as Injector | DestroyRef,
			false,
		];
	}

	if (isObservable(args[0])) {
		return [args[0] as Observable<unknown>, null, null, false];
	}

	return [null, null, args[0] as Injector | DestroyRef, false];
}
