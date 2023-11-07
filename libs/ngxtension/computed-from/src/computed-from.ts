import { Injector, isSignal, untracked, type Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	combineLatest,
	distinctUntilChanged,
	from,
	identity,
	isObservable,
	startWith,
	type ObservableInput,
	type ObservableInputTuple,
	type OperatorFunction,
} from 'rxjs';

export type ObservableSignalInput<T> = ObservableInput<T> | Signal<T>;
export type ComputedFromOptions<T> = {
	readonly injector?: Injector;
	readonly initialValue?: T | null;
}; //Pick<ToSignalOptions<T>,'injector' | 'initialValue'>;
export type InferObservableSignalOutput<I> = {
	[K in keyof I]: I[K] extends Signal<infer S>
		? S
		: I[K] extends ObservableInput<infer O>
		? O
		: never;
};
/**
 * So that we can have `fn([Observable<A>, Signal<B>]): Observable<[A, B]>`
 */
type ObservableSignalInputTuple<T> = {
	[K in keyof T]: ObservableSignalInput<T[K]>;
};

export function computedFrom<Input extends readonly unknown[], Output = Input>(
	sources: readonly [...ObservableSignalInputTuple<Input>],
	operator?: OperatorFunction<Input, Output>,
	options?: ComputedFromOptions<Output>
): Signal<Output>;

export function computedFrom<
	Input extends readonly unknown[],
	Output = Input //InferObservableSignalOutput<Input>
>(
	sources: readonly [...ObservableSignalInputTuple<Input>],
	options?: ComputedFromOptions<Input>
): Signal<Output>;

export function computedFrom<Input extends object, Output = Input>(
	sources: ObservableSignalInputTuple<Input>,
	operator?: OperatorFunction<Input, Output>,
	options?: ComputedFromOptions<Output>
): Signal<Output>;

export function computedFrom<
	Input extends object,
	Output = Input //InferObservableSignalOutput<Input>
>(
	sources: ObservableSignalInputTuple<Input>,
	options?: ComputedFromOptions<Input>
): Signal<Output>;

/**
 * `computedFrom` is a function that takes an array/object with `Observable` or `Signal` values and returns a `Signal` that
 * emits the values of the `Observable` or `Signal` values. It is similar to `combineLatest` but it will emit
 * when the value of the `Observable` or `Signal` changes.
 *
 * @param {ObservableSignalInputTuple} sources - array/object of `Observable` or `Signal` values
 * @param {OperatorFunction} [operator] - operator to apply to the `Observable` or `Signal` values
 * @param {ComputedFromOptions} [options] - options to pass initialValue and/or injector to use to inject the `Observable` or `Signal` values
 * @returns {Signal} - `Signal` that emits the values of the `Observable` or `Signal` values
 *
 * @example
 *
 * ```ts
 * export class MyComponent {
 *  private readonly filtersService = inject(FiltersService);
 *  readonly pageNumber = signal(1);
 *
 *  readonly data = computedFrom(
 *   [this.pageNumber, this.filtersService.filters$],
 *   pipe(
 *     switchMap(([pageNumber, filters]) => this.dataService.getData(pageNumber, filters)),
 *     startWith([])
 *   );
 * }
 * ```
 */
export function computedFrom<Input = any, Output = Input>(
	...args: any[]
): Signal<Output> {
	const { normalizedSources, hasInitValue, operator, options } = _normalizeArgs<
		Input,
		Output
	>(args);

	const injector = assertInjector(computedFrom, options?.injector);
	/* try { // Custom error handling for computedFrom */
	// if you pass options.initialValue return Signal<Output> without any problem even if sources Observable are async (late emit) -> output signal start with passed initialValue!
	// if you don't pass then initialValue enforce that Observable sync emit using the native toSignal requireSync:true option -> so if anyone forget to use startWith it will error!
	const ret: Signal<Output> = hasInitValue
		? toSignal(combineLatest(normalizedSources).pipe(operator), {
				initialValue: options!.initialValue!, // I'm sure initialValue exist because hasInitValue is true
				injector, // eventually passing the injector toSignal to use correct Injection context
		  })
		: toSignal(combineLatest(normalizedSources).pipe(operator), {
				injector, // eventually passing the injector toSignal to use the correct Injection context
				requireSync: true, // thiw will use native toSignal behaviour that check if all Observables emit sync otherwise throw error
				// -> So if anyone forget to use startWith it will error! This is preferred to old "spurious" sync emit of null or Input ([], {})
				// that can cause runtime errors that TS can't catch because the old signature Signal<Output> is not "stricter" for those cases!
		  });
	return ret;
	/* // We can decide to customize the error to be more specific for computedFrom
	} catch (e: any) {
		if ( // euristic to check if error is caused by requireSync
			e.message.includes('requireSync') ||
			e.message.includes('NG601') ||
			e.code == 601
		)
			console.warn(
				`Some Observable sources doesn't emit sync value, please pass options.initialValue to computedFrom, or use startWith operator to ensure initial sync value for all your sources!`
			);
		else
			console.error(
				`computedFrom problem converting toSignal - Details:\n${e}`
			);
		throw e;
	}*/
}

function _normalizeArgs<Input, Output>(
	args: any[]
): {
	normalizedSources: ObservableInputTuple<Input>;
	operator: OperatorFunction<Input, Output>;
	hasInitValue: boolean;
	options: ComputedFromOptions<Output> | undefined;
} {
	if (!args || !args.length || typeof args[0] !== 'object')
		//valid even for Array
		throw new TypeError('computedFrom needs sources');
	const hasOperator = typeof args[1] === 'function';
	if (args.length == 3 && !hasOperator)
		throw new TypeError(
			'computedFrom needs pipeable operator as a second argument'
		);
	if (!hasOperator) args.splice(1, 0, identity);
	const [sources, operator, options] = args;
	const hasInitValue = options?.initialValue !== undefined;
	const normalizedSources = Object.entries(sources).reduce(
		(acc, [keyOrIndex, source]) => {
			if (isSignal(source)) {
				acc[keyOrIndex] = toObservable(source, {
					injector: options?.injector,
				}).pipe(
					startWith(untracked(source)) // this is done because toObservable doesn't immediatly emit initialValue of the signal
				);
			} else if (isObservable(source)) {
				acc[keyOrIndex] = source.pipe(distinctUntilChanged());
			} else {
				acc[keyOrIndex] = from(source as any).pipe(distinctUntilChanged());
			}
			return acc;
		},
		(Array.isArray(sources) ? [] : {}) as any
	);
	return { normalizedSources, operator, hasInitValue, options };
}
