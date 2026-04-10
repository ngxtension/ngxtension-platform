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

					const curr = reducer?.(prev, x) || x;

					if (isDate(curr)) {
						return new Date(curr);
					}

					return { ...prev, ...(curr as object) };
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
					const curr = originSignal();

					if (!isObject(prev)) {
						return curr;
					}

					if (isDate(curr)) {
						return new Date(curr);
					}

					return { ...prev, ...(curr as object) };
				});
			},
			{ injector },
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

function parseArgs(
	args: any[],
): [
	Observable<unknown> | null,
	Reducer<unknown, unknown> | null,
	Injector | DestroyRef | null,
	boolean,
	(() => unknown) | null,
] {
	const array = [...args];

	const observable = isObservable(array[0])
		? (array.shift() as Observable<unknown>)
		: null;

	const originSignal =
		!observable && typeof array[0] === 'function'
			? (array.shift() as () => unknown)
			: null;

	const reducer =
		observable && typeof array[0] === 'function'
			? (array.shift() as Reducer<unknown, unknown>)
			: null;

	const injectorOrDestroyRef =
		array.length > 0 && typeof array[0] !== 'boolean'
			? (array.shift() as Injector | DestroyRef)
			: null;

	const useUntracked =
		typeof array[0] === 'boolean' ? (array.shift() as boolean) : false;

	return [
		observable,
		reducer,
		injectorOrDestroyRef,
		useUntracked,
		originSignal,
	];
}

function isDate(val: any): val is Date {
	return val instanceof Date;
}

function isObject(val: any): val is object {
	return (
		typeof val === 'object' &&
		val !== undefined &&
		val !== null &&
		!Array.isArray(val)
	);
}
