import { Injector, isSignal, untracked, type Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	distinctUntilChanged,
	from,
	identity,
	isObservable,
	merge,
	startWith,
	type ObservableInput,
	type OperatorFunction,
} from 'rxjs';

export type ObservableSignalInput<T> = ObservableInput<T> | Signal<T>;

/**
 * So that we can have `fn([Observable<A>, Signal<B>]): Observable<[A, B]>`
 */
type ObservableSignalInputTuple<T> = {
	[K in keyof T]: ObservableSignalInput<T[K]>;
};

export type MergeFromOptions<T> = {
	readonly injector?: Injector;
	readonly initialValue?: T | null;
};

export function mergeFrom<
	Inputs extends readonly unknown[],
	Output = Inputs[number],
>(
	inputs: readonly [...ObservableSignalInputTuple<Inputs>],
	operator?: OperatorFunction<Inputs[number], Output>,
	options?: MergeFromOptions<Output>,
): Signal<Output>;
export function mergeFrom<
	Inputs extends readonly unknown[],
	Output = Inputs[number],
>(
	inputs: readonly [...ObservableSignalInputTuple<Inputs>],
	options?: MergeFromOptions<Output>,
): Signal<Output>;

export function mergeFrom<
	Inputs extends readonly unknown[],
	Output = Inputs[number],
>(...args: unknown[]) {
	const [sources, operator = identity, options = {}] = parseArgs<
		Inputs,
		Output
	>(args);
	const normalizedSources = sources.map((source) => {
		if (isSignal(source)) {
			return toObservable(source, { injector: options.injector }).pipe(
				startWith(untracked(source)),
			);
		}

		if (!isObservable(source)) {
			source = from(source);
		}

		return source.pipe(distinctUntilChanged());
	});

	const merged = merge(...normalizedSources).pipe(
		operator as OperatorFunction<Inputs[number], Output>,
	);

	return assertInjector(mergeFrom, options.injector, () => {
		if (options.initialValue !== undefined) {
			return toSignal(merged, { initialValue: options.initialValue as Output });
		}
		return toSignal(merged, { requireSync: true });
	});
}

function parseArgs<Inputs extends readonly unknown[], Output = Inputs[number]>(
	args: unknown[],
) {
	if (args.length === 0) {
		throw new Error(
			`[ngxtension] mergeFrom: Expected at least one argument, got none.`,
		);
	}

	if (args.length === 1) {
		return [
			args[0] as readonly [...ObservableSignalInputTuple<Inputs>],
			undefined,
			undefined,
		] as const;
	}

	if (args.length === 2) {
		const isOperator = typeof args[1] === 'function';
		if (isOperator) {
			return [
				args[0] as readonly [...ObservableSignalInputTuple<Inputs>],
				args[1] as OperatorFunction<Inputs[number], Output>,
				undefined,
			] as const;
		}

		return [
			args[0] as readonly [...ObservableSignalInputTuple<Inputs>],
			undefined,
			args[1] as MergeFromOptions<Output>,
		] as const;
	}

	return args as unknown as [
		readonly [...ObservableSignalInputTuple<Inputs>],
		OperatorFunction<Inputs[number], Output>,
		MergeFromOptions<Output>,
	];
}
