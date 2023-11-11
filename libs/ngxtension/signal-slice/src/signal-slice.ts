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
import { Observable, Subject, isObservable } from 'rxjs';

type Source<TSignalValue> = Observable<PartialOrValue<TSignalValue>>;
type SourceReducer<TValue, TNext> = (obs$: Observable<TNext>) => Source<TValue>;

type NamedReducers<TSignalValue> = {
	[actionName: string]:
		| Reducer<TSignalValue, any>
		| SourceReducer<TSignalValue, any>;
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
	[K in keyof TSelectors]: () => any;
};

type Effects<TEffects extends NamedEffects> = {
	[K in keyof TEffects]: EffectRef;
};

type ActionMethods<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>
> = {
	[K in keyof TReducers]: TReducers[K] extends Reducer<TSignalValue, unknown>
		? () => void
		: TReducers[K] extends Reducer<TSignalValue, infer TValue>
		? (value: TValue | Observable<TValue>) => void
		: TReducers[K] extends SourceReducer<TSignalValue, infer TValue>
		? (value: TValue | Observable<TValue>) => void
		: never;
};

type ActionStreams<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>
> = {
	[K in keyof TReducers & string as `${K}$`]: TReducers[K] extends Reducer<
		TSignalValue,
		unknown
	>
		? Observable<void>
		: TReducers[K] extends Reducer<TSignalValue, infer TValue>
		? Observable<TValue>
		: TReducers[K] extends SourceReducer<TSignalValue, infer TValue>
		? Observable<TValue>
		: never;
};

export type SignalSlice<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects
> = Signal<TSignalValue> &
	Selectors<TSignalValue> &
	ExtraSelectors<TSelectors> &
	Effects<TEffects> &
	ActionMethods<TSignalValue, TReducers> &
	ActionStreams<TSignalValue, TReducers>;

export function signalSlice<
	TSignalValue,
	TReducers extends NamedReducers<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects
>(config: {
	initialState: TSignalValue;
	sources?: Array<Source<TSignalValue>>;
	reducers?: TReducers;
	selectors?: (state: Signal<TSignalValue>) => TSelectors;
	effects?: (
		state: SignalSlice<TSignalValue, TReducers, TSelectors, any>
	) => TEffects;
}): SignalSlice<TSignalValue, TReducers, TSelectors, TEffects> {
	const destroyRef = inject(DestroyRef);

	const {
		initialState,
		sources = [],
		reducers = {},
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

	for (const source of sources) {
		connect(state, source);
	}

	const readonlyState = state.asReadonly();
	const subs: Subject<unknown>[] = [];

	for (const [key, reducer] of Object.entries(reducers as TReducers)) {
		const subject = new Subject();

		if (reducer.length === 2) {
			const standardReducer = reducer as Reducer<
				(typeof config)['initialState'],
				any
			>;
			connect(state, subject, standardReducer);
		} else {
			const sourceReducer = reducer as SourceReducer<
				(typeof config)['initialState'],
				any
			>;

			connect(state, sourceReducer(subject));
		}

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
