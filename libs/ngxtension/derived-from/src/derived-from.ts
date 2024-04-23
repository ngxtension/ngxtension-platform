import {
	Injector,
	computed,
	isSignal,
	untracked,
	type Signal,
} from '@angular/core';
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
export type DerivedFromOptions<T> = {
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
	[K in keyof T]: ObservableSignalInput<T[K]> | (() => T[K]);
};

export function derivedFrom<Input extends readonly unknown[], Output = Input>(
	sources: readonly [...ObservableSignalInputTuple<Input>],
	operator?: OperatorFunction<Input, Output>,
	options?: DerivedFromOptions<Output>,
): Signal<Output>;

export function derivedFrom<
	Input extends readonly unknown[],
	Output = Input, //InferObservableSignalOutput<Input>
>(
	sources: readonly [...ObservableSignalInputTuple<Input>],
	options?: DerivedFromOptions<Input>,
): Signal<Output>;

export function derivedFrom<Input extends object, Output = Input>(
	sources: ObservableSignalInputTuple<Input>,
	operator?: OperatorFunction<Input, Output>,
	options?: DerivedFromOptions<Output>,
): Signal<Output>;

export function derivedFrom<
	Input extends object,
	Output = Input, //InferObservableSignalOutput<Input>
>(
	sources: ObservableSignalInputTuple<Input>,
	options?: DerivedFromOptions<Input>,
): Signal<Output>;

/**
 * `derivedFrom` is a function that takes an array/object with `Observable` or `Signal` values and returns a `Signal` that
 * emits the values of the `Observable` or `Signal` values. It is similar to `combineLatest` but it will emit
 * when the value of the `Observable` or `Signal` changes.
 *
 * @param {ObservableSignalInputTuple} sources - array/object of `Observable` or `Signal` values
 * @param {OperatorFunction} [operator] - operator to apply to the `Observable` or `Signal` values
 * @param {DerivedFromOptions} [options] - options to pass initialValue and/or injector to use to inject the `Observable` or `Signal` values
 * @returns {Signal} - `Signal` that emits the values of the `Observable` or `Signal` values
 *
 * @example
 *
 * ```ts
 * export class MyComponent {
 *  private readonly filtersService = inject(FiltersService);
 *  readonly pageNumber = signal(1);
 *
 *  readonly data = derivedFrom(
 *   [this.pageNumber, this.filtersService.filters$],
 *   pipe(
 *     switchMap(([pageNumber, filters]) => this.dataService.getData(pageNumber, filters)),
 *     startWith([])
 *   );
 * }
 * ```
 */
export function derivedFrom<Input = any, Output = Input>(
	...args: any[]
): Signal<Output> {
	const { normalizedSources, hasInitValue, operator, options } = _normalizeArgs<
		Input,
		Output
	>(args);

	const injector = assertInjector(derivedFrom, options?.injector);
	/* try { // Custom error handling for derivedFrom */
	const ret: Signal<Output> = hasInitValue
		? toSignal(combineLatest(normalizedSources).pipe(operator), {
				initialValue: options!.initialValue!,
				injector,
			})
		: toSignal(combineLatest(normalizedSources).pipe(operator), {
				injector,
				requireSync: true,
			});
	return ret;
}

function _normalizeArgs<Input, Output>(
	args: any[],
): {
	normalizedSources: ObservableInputTuple<Input>;
	operator: OperatorFunction<Input, Output>;
	hasInitValue: boolean;
	options: DerivedFromOptions<Output> | undefined;
} {
	if (!args || !args.length || typeof args[0] !== 'object')
		//valid even for Array
		throw new TypeError('derivedFrom needs sources');
	const hasOperator = typeof args[1] === 'function';
	if (args.length == 3 && !hasOperator)
		throw new TypeError(
			'derivedFrom needs pipeable operator as a second argument',
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
					startWith(
						untracked(source),
					) /* this is done because toObservable doesn't immediatly emit initialValue of the signal */,
				);
			} else if (isObservable(source)) {
				acc[keyOrIndex] = source.pipe(distinctUntilChanged());
			} else if (typeof source === 'function') {
				const computedFn = computed(source as () => unknown);
				acc[keyOrIndex] = toObservable(computedFn, {
					injector: options?.injector,
				}).pipe(startWith(source() as any));
			} else {
				acc[keyOrIndex] = from(source as any).pipe(distinctUntilChanged());
			}
			return acc;
		},
		(Array.isArray(sources) ? [] : {}) as any,
	);
	return { normalizedSources, operator, hasInitValue, options };
}
