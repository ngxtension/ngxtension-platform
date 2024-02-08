import {
	DestroyRef,
	Injector,
	effect,
	untracked,
	type EffectRef,
	type WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { Subscription, isObservable, type Observable } from 'rxjs';

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
	with<TOriginSignalValue extends PartialOrValue<TSignalValue>>(
		originSignal: () => TOriginSignalValue,
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

/**
 * Connects a signal to another signal value.
 * @param signal The signal to connect to.
 * @param originSignal A callback fn that includes a signal call. The signal call will be tracked.
 *
 * Usage
 * ```ts
 * export class MyComponent {
 * 	private dataService = inject(DataService);
 *
 * 	name = signal('');
 *
 *  constructor() {
 *    connect(this.name, () => this.dataService.user().name);
 *  }
 * }
 * ```
 */
export function connect<TSignalValue>(
	signal: WritableSignal<TSignalValue>,
	originSignal: () => TSignalValue,
): EffectRef;

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
	const [
		observable,
		reducer,
		injectorOrDestroyRef,
		useUntracked,
		originSignal,
	] = parseArgs(args);

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
					if (!isObject(prev)) {
						return reducer?.(prev, x) || x;
					}

					if (!isObject(x)) {
						const reducedValue = reducer ? reducer(prev, x) : x;
						return isObject(reducedValue)
							? { ...prev, ...(reducedValue as object) }
							: reducedValue;
					}

					return { ...prev, ...((reducer?.(prev, x) || x) as object) };
				});
			};

			if (useUntracked) {
				untracked(update);
			} else {
				update();
			}
		});
	}

	if (originSignal) {
		const injector =
			injectorOrDestroyRef instanceof Injector
				? assertInjector(connect, injectorOrDestroyRef)
				: undefined;

		return effect(
			() => {
				signal.update((prev) => {
					if (!isObject(prev)) {
						return originSignal();
					}

					return { ...prev, ...(originSignal() as object) };
				});
			},
			{
				allowSignalWrites: true,
				injector,
			},
		);
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
	(() => unknown) | null,
] {
	if (args.length > 3) {
		return [
			args[0] as Observable<unknown>,
			args[1] as Reducer<unknown, unknown>,
			args[2] as Injector | DestroyRef,
			args[3] as boolean,
			null,
		];
	}

	if (args.length === 3) {
		if (typeof args[2] === 'boolean') {
			if (isObservable(args[0])) {
				return [
					args[0] as Observable<unknown>,
					null,
					args[1] as Injector | DestroyRef,
					args[2],
					null,
				];
			} else {
				return [
					null,
					null,
					args[1] as Injector | DestroyRef,
					args[2],
					args[0] as () => unknown,
				];
			}
		}

		return [
			args[0] as Observable<unknown>,
			args[1] as Reducer<unknown, unknown>,
			args[2] as Injector | DestroyRef,
			false,
			null,
		];
	}

	if (args.length === 2) {
		if (typeof args[1] === 'boolean') {
			return [null, null, args[0] as Injector | DestroyRef, args[1], null];
		}

		if (typeof args[1] === 'function') {
			return [
				args[0] as Observable<unknown>,
				args[1] as Reducer<unknown, unknown>,
				null,
				false,
				null,
			];
		}

		return [
			args[0] as Observable<unknown>,
			null,
			args[1] as Injector | DestroyRef,
			false,
			null,
		];
	}

	if (isObservable(args[0])) {
		return [args[0] as Observable<unknown>, null, null, false, null];
	}

	// to connect signals to other signals, we need to use a callback that includes a signal call
	if (typeof args[0] === 'function') {
		return [null, null, null, false, args[0] as () => unknown];
	}

	return [null, null, args[0] as Injector | DestroyRef, false, null];
}

function isObject(val: any): val is object {
	return (
		typeof val === 'object' &&
		val !== undefined &&
		val !== null &&
		!Array.isArray(val)
	);
}
