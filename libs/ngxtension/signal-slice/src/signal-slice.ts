import {
	DestroyRef,
	computed,
	effect,
	inject,
	signal,
	type EffectRef,
	type Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { connect, type PartialOrValue, type Reducer } from 'ngxtension/connect';
import { Subject, isObservable, type Observable } from 'rxjs';

type NamedReducers<TSignalValue> = {
	[actionName: string]: (
		state: TSignalValue,
		value: any
	) => PartialOrValue<TSignalValue>;
};

type NamedAsyncReducers<TSignalValue> = {
	[actionName: string]: (
		state: Signal<TSignalValue>,
		value: any
	) => Observable<PartialOrValue<TSignalValue>>;
};

type NamedSelectors = {
	[selectorName: string]: () => any;
};

type NamedEffects = {
	[selectorName: string]: () => void | (() => void);
};

type Selectors<TSignalValue> = {
	[K in keyof TSignalValue]: Signal<TSignalValue[K]>;
};

type ExtraSelectors<TSelectors extends NamedSelectors> = {
	[K in keyof TSelectors]: Signal<ReturnType<TSelectors[K]>>;
};

type Effects<TEffects extends NamedEffects> = {
	[K in keyof TEffects]: EffectRef;
};

type Action<TValue> = TValue extends void
	? () => void
	: unknown extends TValue
	? () => void
	: (value: TValue | Observable<TValue>) => void;

type ActionMethod<
	TSignalValue,
	TReducer extends NamedReducers<TSignalValue>[string]
> = TReducer extends (state: TSignalValue, value: infer TValue) => any
	? TValue extends Observable<infer TObservableValue>
		? Action<TObservableValue>
		: Action<TValue>
	: never;

type AsyncActionMethod<
	TSignalValue,
	TAsyncReducer extends NamedAsyncReducers<TSignalValue>[string]
> = TAsyncReducer extends (
	state: Signal<TSignalValue>,
	value: infer TValue
) => any
	? TValue extends Observable<infer TObservableValue>
		? Action<TObservableValue>
		: Action<TValue>
	: never;

type ActionMethods<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>,
	TAsyncReducers extends NamedAsyncReducers<TSignalValue>
> = {
	[K in keyof TReducers]: ActionMethod<TSignalValue, TReducers[K]>;
} & {
	[K in keyof TAsyncReducers]: AsyncActionMethod<
		TSignalValue,
		TAsyncReducers[K]
	>;
};

type ActionStreams<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>,
	TAsyncReducers extends NamedAsyncReducers<TSignalValue>
> = {
	[K in keyof TReducers & string as `${K}$`]: TReducers[K] extends Reducer<
		TSignalValue,
		unknown
	>
		? Observable<void>
		: TReducers[K] extends Reducer<TSignalValue, infer TValue>
		? TValue extends Observable<any>
			? TValue
			: Observable<TValue>
		: never;
} & {
	[K in keyof TAsyncReducers &
		string as `${K}$`]: TAsyncReducers[K] extends Reducer<TSignalValue, unknown>
		? Observable<void>
		: TReducers[K] extends Reducer<TSignalValue, infer TValue>
		? TValue extends Observable<any>
			? TValue
			: Observable<TValue>
		: never;
};

export type Source<TSignalValue> = Observable<PartialOrValue<TSignalValue>>;

export type SignalSlice<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>,
	TAsyncReducers extends NamedAsyncReducers<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects
> = Signal<TSignalValue> &
	Selectors<TSignalValue> &
	ExtraSelectors<TSelectors> &
	Effects<TEffects> &
	ActionMethods<TSignalValue, TReducers, TAsyncReducers> &
	ActionStreams<TSignalValue, TReducers, TAsyncReducers>;

export function signalSlice<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>,
	TAsyncReducers extends NamedAsyncReducers<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects
>(config: {
	initialState: TSignalValue;
	sources?: Array<
		| Source<TSignalValue>
		| ((state: Signal<TSignalValue>) => Source<TSignalValue>)
	>;
	reducers?: TReducers;
	asyncReducers?: TAsyncReducers;
	selectors?: (state: Signal<TSignalValue>) => TSelectors;
	effects?: (
		state: SignalSlice<TSignalValue, TReducers, TAsyncReducers, TSelectors, any>
	) => TEffects;
}): SignalSlice<TSignalValue, TReducers, TAsyncReducers, TSelectors, TEffects> {
	const destroyRef = inject(DestroyRef);

	const {
		initialState,
		sources = [],
		reducers = {},
		asyncReducers = {},
		selectors = (() => ({})) as unknown as Exclude<
			(typeof config)['selectors'],
			undefined
		>,
		effects = (() => ({})) as unknown as Exclude<
			(typeof config)['effects'],
			undefined
		>,
	} = config;

	const state = signal(initialState);

	const readonlyState = state.asReadonly();
	const subs: Subject<unknown>[] = [];

	for (const source of sources) {
		if (isObservable(source)) {
			connect(state, source);
		} else {
			connect(state, source(readonlyState));
		}
	}

	for (const [key, reducer] of Object.entries(reducers as TReducers)) {
		const subject = new Subject();

		connect(state, subject, reducer);
		addReducerProperties(readonlyState, key, destroyRef, subject, subs);
	}

	for (const [key, asyncReducer] of Object.entries(
		asyncReducers as TAsyncReducers
	)) {
		const subject = new Subject();
		const observable = asyncReducer(readonlyState, subject);
		connect(state, observable);
		addReducerProperties(readonlyState, key, destroyRef, subject, subs);
	}

	for (const key in initialState) {
		Object.defineProperty(readonlyState, key, {
			value: computed(() => readonlyState()[key]),
		});
	}

	for (const [key, selector] of Object.entries(selectors(readonlyState))) {
		Object.defineProperty(readonlyState, key, {
			value: computed(selector),
		});
	}

	const slice = readonlyState as SignalSlice<
		TSignalValue,
		TReducers,
		TAsyncReducers,
		TSelectors,
		TEffects
	>;

	for (const [key, namedEffect] of Object.entries(effects(slice))) {
		Object.defineProperty(slice, key, {
			value: effect((onCleanup) => {
				const maybeCleanup = namedEffect();
				if (maybeCleanup) {
					onCleanup(() => maybeCleanup());
				}
			}),
		});
	}

	destroyRef.onDestroy(() => {
		subs.forEach((sub) => sub.complete());
	});

	return slice;
}

function addReducerProperties(
	readonlyState: Signal<unknown>,
	key: string,
	destroyRef: DestroyRef,
	subject: Subject<unknown>,
	subs: Subject<unknown>[]
) {
	Object.defineProperties(readonlyState, {
		[key]: {
			value: (nextValue: unknown) => {
				if (isObservable(nextValue)) {
					nextValue.pipe(takeUntilDestroyed(destroyRef)).subscribe(subject);
				} else {
					subject.next(nextValue);
				}
			},
		},
		[`${key}$`]: {
			value: subject.asObservable(),
		},
	});
	subs.push(subject);
}
