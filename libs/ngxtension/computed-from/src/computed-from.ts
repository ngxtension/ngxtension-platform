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

	let injector = options?.injector;
	injector = assertInjector(computedFrom, injector);
	/* try { //CUSTOM ERROR HANDLING FOR computedFrom */
	//IF YOU PASS options.initialValue RETURN Signal<Output> WITHOUT ANY PROBLEM EVEN IF sources Observable ARE ASYNC (LATE EMIT) -> OUTPUT SIGNAL START EMITING SYNC initialValue!
	//IF YOU DON'T PASS THE initialValue ENFORCE THAT Observable SYNC EMIT USING THE NATIVE toSignal requireSync:true OPTION -> SO IF ANYONE FORGET TO USE startWith IT WILL ERROR!
	const ret: Signal<Output> = hasInitValue
		? toSignal(combineLatest(normalizedSources).pipe(operator), {
				initialValue: options?.initialValue!, //I'M SURE initialValue EXIST BECAUSE hasInitValue IS TRUE
				injector: options?.injector, //EVENTUALLY PASSING toSignal THE injector TO USE THE CORRECT INJECTION CONTEXT
		  })
		: toSignal(combineLatest(normalizedSources).pipe(operator), {
				injector: options?.injector, //EVENTUALLY PASSING toSignal THE injector TO USE THE CORRECT INJECTION CONTEXT
				requireSync: true, //THIS WILL USE NATIVE toSignal BEHAVIOR THAT CHECK IF ALL OBSERVABLE EMIT SYNC OTHERWISE THROW ERROR
				// -> SO IF ANYONE FORGET TO USE startWith IT WILL ERROR! THIS IS PREFERRED TO OLD "SPURIOUS SYNC EMIT" OF null OR Input ([], {})
				//THAT CAN CAUSE RUNTIMES ERRORS THAT TS CAN'T CATCH BECOUSE THE OLD SIGNATURE Signal<Output> IS NOT "STRICTIER" FOR THOSE CASES!
		  });
	return ret;
	/* //WE CAN DECIDE TO CUSTOMIZE THE ERROR TO BE MORE SPECIFIC FOR computedFrom
	} catch (e: any) {
		if ( //EURISTIC TO CHECK IF THE ERROR IS CAUSED BY requireSync
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
		//VALID EVEN FOR ARRAY
		throw new TypeError('computedFrom need sources');
	const hasOperator = typeof args[1] === 'function';
	if (args.length == 3 && !hasOperator)
		throw new TypeError('computedFrom need pipebale operator as second arg');
	if (!hasOperator) args.splice(1, 0, identity);
	const [sources, operator, options] = args;
	const hasInitValue = options?.initialValue !== undefined;
	const normalizedSources = Object.entries(sources).reduce(
		(acc, [keyOrIndex, source]) => {
			if (isSignal(source)) {
				acc[keyOrIndex] = toObservable(source, {
					injector: options?.injector,
				}).pipe(
					startWith(untracked(source)) //THIS IS DONE BECAUSE toObservable DOESN'T IMMEDIATLY EMIT initialValue OF THE THE SIGNAL
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
