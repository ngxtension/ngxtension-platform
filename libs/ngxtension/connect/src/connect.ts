import { DestroyRef, Injector, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { Subscription, isObservable, type Observable } from 'rxjs';

type PartialOrValue<TValue> = TValue extends object ? Partial<TValue> : TValue;
type Reducer<TValue, TNext> = (
	previous: TValue,
	next: TNext
) => PartialOrValue<TValue>;

type ConnectedSignal<TSignalValue> = {
	with<TObservableValue extends PartialOrValue<TSignalValue>>(
		observable: Observable<TObservableValue>
	): ConnectedSignal<TSignalValue>;
	with<TObservableValue>(
		observable: Observable<TObservableValue>,
		reducer: Reducer<TSignalValue, TObservableValue>
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
	injectorOrDestroyRef?: Injector | DestroyRef
): ConnectedSignal<TSignalValue>;
export function connect<
	TSignalValue,
	TObservableValue extends PartialOrValue<TSignalValue>
>(
	signal: WritableSignal<TSignalValue>,
	observable: Observable<TObservableValue>,
	injectorOrDestroyRef?: Injector | DestroyRef
): Subscription;
export function connect<TSignalValue, TObservableValue>(
	signal: WritableSignal<TSignalValue>,
	observable: Observable<TObservableValue>,
	reducer: Reducer<TSignalValue, TObservableValue>,
	injectorOrDestroyRef?: Injector | DestroyRef
): Subscription;
export function connect(
	signal: WritableSignal<unknown>,
	...args: [
		(Observable<unknown> | (Injector | DestroyRef))?,
		(Reducer<unknown, unknown> | (Injector | DestroyRef))?,
		(Injector | DestroyRef)?
	]
) {
	const [observable, reducer, injectorOrDestroyRef] = parseArgs(args);

	if (observable) {
		let destroyRef = null;

		if (injectorOrDestroyRef instanceof DestroyRef) {
			destroyRef = injectorOrDestroyRef; // if it's a DestroyRef, use it
		} else {
			const injector = assertInjector(connect, injectorOrDestroyRef);
			destroyRef = injector.get(DestroyRef);
		}

		return observable.pipe(takeUntilDestroyed(destroyRef)).subscribe((x) => {
			signal.update((prev) => {
				if (typeof prev === 'object' && !Array.isArray(prev)) {
					return { ...prev, ...((reducer?.(prev, x) || x) as object) };
				}

				return reducer?.(prev, x) || x;
			});
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
					injectorOrDestroyRef
				) as unknown as Subscription
			);
			return this;
		},
		subscription: null!,
	} as ConnectedSignal<unknown>;
}

function parseArgs(
	args: [
		(Observable<unknown> | (Injector | DestroyRef))?,
		(Reducer<unknown, unknown> | (Injector | DestroyRef))?,
		(Injector | DestroyRef)?
	]
): [
	Observable<unknown> | null,
	Reducer<unknown, unknown> | null,
	Injector | DestroyRef | null
] {
	if (args.length > 2) {
		return [
			args[0] as Observable<unknown>,
			args[1] as Reducer<unknown, unknown>,
			args[2] as Injector | DestroyRef,
		];
	}

	if (args.length === 2) {
		const [arg, arg2] = args;
		const parsedArgs: [
			Observable<unknown>,
			Reducer<unknown, unknown> | null,
			Injector | DestroyRef | null
		] = [arg as Observable<unknown>, null, null];
		if (typeof arg2 === 'function') {
			parsedArgs[1] = arg2;
		} else {
			parsedArgs[2] = arg2 as Injector | DestroyRef;
		}

		return parsedArgs;
	}

	const arg = args[0];
	if (isObservable(arg)) {
		return [arg, null, null];
	}

	return [null, null, arg as Injector | DestroyRef];
}
