import {
	DestroyRef,
	computed,
	effect,
	inject,
	signal,
	type EffectRef,
	type Signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { connect, type PartialOrValue, type Reducer } from 'ngxtension/connect';
import { Subject, isObservable, take, type Observable } from 'rxjs';

type NamedActionSources<TSignalValue> = {
	[actionName: string]:
		| Subject<any>
		| ((
				state: Signal<TSignalValue>,
				value: any
		  ) => Observable<PartialOrValue<TSignalValue>>);
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

type Action<TSignalValue, TValue> = TValue extends void
	? () => Promise<TSignalValue>
	: unknown extends TValue
	? () => Promise<TSignalValue>
	: (value: TValue | Observable<TValue>) => Promise<TSignalValue>;

type ActionMethod<
	TSignalValue,
	TActionSource extends NamedActionSources<TSignalValue>[string]
> = TActionSource extends
	| ((state: Signal<TSignalValue>, value: infer TValue) => any)
	| Subject<infer TValue>
	? TValue extends Observable<infer TObservableValue>
		? Action<TSignalValue, TObservableValue>
		: Action<TSignalValue, TValue>
	: never;

type ActionMethods<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>
> = {
	[K in keyof TActionSources]: ActionMethod<TSignalValue, TActionSources[K]>;
};

type ActionStreams<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>
> = {
	[K in keyof TActionSources &
		string as `${K}$`]: TActionSources[K] extends Reducer<TSignalValue, unknown>
		? Observable<void>
		: TActionSources[K] extends Reducer<TSignalValue, infer TValue>
		? TValue extends Observable<any>
			? TValue
			: Observable<TValue>
		: never;
};

export type Source<TSignalValue> = Observable<PartialOrValue<TSignalValue>>;

export type SignalSlice<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects
> = Signal<TSignalValue> &
	Selectors<TSignalValue> &
	ExtraSelectors<TSelectors> &
	Effects<TEffects> &
	ActionMethods<TSignalValue, TActionSources> &
	ActionStreams<TSignalValue, TActionSources>;

export function signalSlice<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects
>(config: {
	initialState: TSignalValue;
	sources?: Array<
		| Source<TSignalValue>
		| ((state: Signal<TSignalValue>) => Source<TSignalValue>)
	>;
	actionSources?: TActionSources;
	selectors?: (state: Signal<TSignalValue>) => TSelectors;
	effects?: (
		state: SignalSlice<TSignalValue, TActionSources, TSelectors, any>
	) => TEffects;
}): SignalSlice<TSignalValue, TActionSources, TSelectors, TEffects> {
	const destroyRef = inject(DestroyRef);

	const {
		initialState,
		sources = [],
		actionSources = {},
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
	const state$ = toObservable(state);

	const subs: Subject<unknown>[] = [];

	for (const source of sources) {
		if (isObservable(source)) {
			connect(state, source);
		} else {
			connect(state, source(readonlyState));
		}
	}

	for (const [key, actionSource] of Object.entries(
		actionSources as TActionSources
	)) {
		if (isObservable(actionSource)) {
			addReducerProperties(
				readonlyState,
				state$,
				key,
				destroyRef,
				actionSource,
				subs
			);
		} else {
			const subject = new Subject();
			const observable = actionSource(readonlyState, subject);
			connect(state, observable);
			addReducerProperties(
				readonlyState,
				state$,
				key,
				destroyRef,
				subject,
				subs
			);
		}
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
		TActionSources,
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
	state$: Observable<unknown>,
	key: string,
	destroyRef: DestroyRef,
	subject: Subject<unknown>,
	subs: Subject<unknown>[]
) {
	Object.defineProperties(readonlyState, {
		[key]: {
			value: (nextValue: unknown) => {
				if (isObservable(nextValue)) {
					return new Promise((res, rej) => {
						nextValue.pipe(takeUntilDestroyed(destroyRef)).subscribe({
							next: subject.next.bind(subject),
							error: (err) => {
								subject.error(err);
								rej(err);
							},
							complete: () => {
								subject.complete();
								res(readonlyState());
							},
						});
					});
				}

				return new Promise((res) => {
					state$.pipe(take(1)).subscribe((val) => {
						res(val);
					});
					subject.next(nextValue);
				});
			},
		},
		[`${key}$`]: {
			value: subject.asObservable(),
		},
	});
	subs.push(subject);
}
