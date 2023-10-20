import { DestroyRef, Injector, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { Subscription, type Observable } from 'rxjs';

type PartialOrValue<TValue> = TValue extends object ? Partial<TValue> : TValue;
type Reducer<TValue, TNext> = (
	previous: TValue,
	next: TNext
) => PartialOrValue<TValue>;

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
	observable: Observable<unknown>,
	...args: [
		(Reducer<unknown, unknown> | (Injector | DestroyRef))?,
		(Injector | DestroyRef)?
	]
) {
	const [reducer, injectorOrDestroyRef] = parseArgs(args);

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

function parseArgs(
	args: [
		(Reducer<unknown, unknown> | (Injector | DestroyRef))?,
		(Injector | DestroyRef)?
	]
): [Reducer<unknown, unknown> | null, Injector | DestroyRef | null] {
	if (args.length > 1) {
		return [
			args[0] as Reducer<unknown, unknown>,
			args[1] as Injector | DestroyRef,
		];
	}

	if (args.length === 1) {
		const arg = args[0];

		if (typeof arg === 'function') {
			return [arg, null];
		}

		return [null, arg as Injector | DestroyRef];
	}

	return [null, null];
}

// export function connectSlice<T extends object, K extends string>(
// 	signal: WritableSignal<T>,
// 	slice: F.AutoPath<T, K>,
// 	observable: Observable<O.Path<T, S.Split<K, '.'>>>,
// 	injectorOrDestroyRef?: Injector | DestroyRef
// ) {
// 	let destroyRef = null;
//
// 	if (injectorOrDestroyRef instanceof DestroyRef) {
// 		destroyRef = injectorOrDestroyRef; // if it's a DestroyRef, use it
// 	} else {
// 		const injector = assertInjector(connect, injectorOrDestroyRef);
// 		destroyRef = injector.get(DestroyRef);
// 	}
//
// 	const updater = (sliceValue: O.Path<T, S.Split<K, '.'>>) => {
//     return (signalValue: T) => {
//
//     }
//   }
//
//
// 	return observable.pipe(takeUntilDestroyed(destroyRef)).subscribe((value) => {
// 		signal.update();
// 	});
// }
