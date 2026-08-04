import {
	effect as angularEffect,
	type CreateEffectOptions,
	type EffectCleanupRegisterFn,
	type EffectRef,
	untracked,
} from '@angular/core';

export type EffectDependency<Value = unknown> = () => Value;

type DependencyValue<Dependency> =
	Dependency extends EffectDependency<infer Value> ? Value : never;

type DependencyValues<Dependencies extends readonly EffectDependency[]> = {
	-readonly [Index in keyof Dependencies]: DependencyValue<Dependencies[Index]>;
};

type PreviousValues<Values extends readonly unknown[]> = {
	-readonly [Index in keyof Values]: Values[Index] | undefined;
};

type NonNullishValues<Values extends readonly unknown[]> = {
	-readonly [Index in keyof Values]: NonNullable<Values[Index]>;
};

const isNullish = (value: unknown): value is null | undefined =>
	value === null || value === undefined;

export const nullishValues = <Values extends readonly unknown[]>(
	values: Values,
): values is NonNullishValues<Values> => !values.some(isNullish);

type EffectCallback<Values extends readonly unknown[], ReturnValue = void> = (
	values: Values,
	previousValues: PreviousValues<Values>,
	onCleanup: EffectCleanupRegisterFn,
	previousReturnValue: ReturnValue | undefined,
) => ReturnValue;

type EffectPredicate<Dependencies extends readonly EffectDependency[]> = (
	values: DependencyValues<Dependencies>,
	previousValues: PreviousValues<DependencyValues<Dependencies>>,
) => boolean;

type EffectFilter<
	Dependencies extends readonly EffectDependency[],
	FilteredValues extends DependencyValues<Dependencies>,
> = (
	values: DependencyValues<Dependencies>,
	previousValues: PreviousValues<DependencyValues<Dependencies>>,
) => values is FilteredValues;

interface EffectBehaviorOptions<
	Dependencies extends
		readonly EffectDependency[] = readonly EffectDependency[],
> {
	/**
	 * Skip the initial effect run and execute the callback only after a dependency changes.
	 */
	defer?: boolean;

	/**
	 * Skip callback execution while the predicate returns false.
	 */
	filter?: EffectPredicate<Dependencies>;

	/**
	 * Destroy the effect after the first callback execution.
	 */
	once?: boolean;
}

type FilteredEffectBehaviorOptions<
	Dependencies extends readonly EffectDependency[],
	FilteredValues extends DependencyValues<Dependencies>,
> = Omit<EffectBehaviorOptions<Dependencies>, 'filter'> & {
	filter: EffectFilter<Dependencies, FilteredValues>;
};

type RuntimeValues = DependencyValues<readonly EffectDependency[]>;
type RuntimeEffectCallback = (
	values: readonly unknown[],
	previousValues: PreviousValues<readonly unknown[]>,
	onCleanup: EffectCleanupRegisterFn,
	previousReturnValue: unknown,
) => unknown;
type AnyEffectCallback = EffectCallback<any, any>;

type EffectArgumentsWithBehavior = [
	behaviorOptions: EffectBehaviorOptions,
	callback: AnyEffectCallback,
	effectOptions?: CreateEffectOptions,
];

type EffectArgumentsWithoutBehavior = [
	callback: AnyEffectCallback,
	effectOptions?: CreateEffectOptions,
];

type EffectArguments =
	| EffectArgumentsWithBehavior
	| EffectArgumentsWithoutBehavior;

export function effect<
	const Dependencies extends readonly EffectDependency[],
	FilteredValues extends DependencyValues<Dependencies>,
	ReturnValue,
>(
	dependencies: readonly [...Dependencies],
	behaviorOptions: FilteredEffectBehaviorOptions<Dependencies, FilteredValues>,
	callback: EffectCallback<FilteredValues, ReturnValue>,
	effectOptions?: CreateEffectOptions,
): EffectRef;
export function effect<
	const Dependencies extends readonly EffectDependency[],
	ReturnValue,
>(
	dependencies: readonly [...Dependencies],
	behaviorOptions: EffectBehaviorOptions<Dependencies>,
	callback: EffectCallback<DependencyValues<Dependencies>, ReturnValue>,
	effectOptions?: CreateEffectOptions,
): EffectRef;
export function effect<
	const Dependencies extends readonly EffectDependency[],
	ReturnValue,
>(
	dependencies: readonly [...Dependencies],
	callback: EffectCallback<DependencyValues<Dependencies>, ReturnValue>,
	effectOptions?: CreateEffectOptions,
): EffectRef;
export function effect(
	dependencies: readonly EffectDependency[],
	...args: EffectArguments
): EffectRef {
	const { behaviorOptions, callback, effectOptions } =
		normalizeEffectArguments(args);
	const { defer = false, once = false, filter } = behaviorOptions;
	let shouldDefer = defer;
	let previousValues = dependencies.map(
		() => undefined,
	) as PreviousValues<RuntimeValues>;
	let previousReturnValue: unknown;

	const effectRef = angularEffect((onCleanup) => {
		const values = dependencies.map((dependency) =>
			dependency(),
		) as RuntimeValues;

		if (shouldDefer) {
			shouldDefer = false;
			return;
		}

		if (filter && !filter(values, previousValues)) {
			return;
		}

		previousReturnValue = untracked(() => {
			return callback(values, previousValues, onCleanup, previousReturnValue);
		});
		previousValues = values;

		if (once) {
			effectRef.destroy();
		}
	}, effectOptions);

	return effectRef;
}

function normalizeEffectArguments(args: EffectArguments): {
	behaviorOptions: EffectBehaviorOptions;
	callback: RuntimeEffectCallback;
	effectOptions?: CreateEffectOptions;
} {
	if (typeof args[0] === 'function') {
		const [callback, effectOptions] = args as EffectArgumentsWithoutBehavior;

		return {
			behaviorOptions: {},
			callback,
			effectOptions,
		};
	}

	const [behaviorOptions, callback, effectOptions] =
		args as EffectArgumentsWithBehavior;

	return {
		behaviorOptions,
		callback,
		effectOptions,
	};
}
