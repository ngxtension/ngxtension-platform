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
import { Subject, isObservable, share, take, type Observable } from 'rxjs';

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

type ActionEffectTrigger = { name: string; payload: any; value: any; err: any };

type Selectors<TSignalValue> = {
	[K in keyof TSignalValue]: Signal<TSignalValue[K]>;
};

type ExtraSelectors<TSelectors extends NamedSelectors> = {
	[K in keyof TSelectors]: Signal<ReturnType<TSelectors[K]>>;
};

type Effects<TEffects extends NamedEffects> = {
	[K in keyof TEffects]: EffectRef;
};

type ActionEffects<
	TSignalValue,
	TActionEffects extends NamedActionEffects<
		TSignalValue,
		NamedActionSources<TSignalValue>
	>
> = Partial<{
	[K in keyof TActionEffects]: void;
}>;

type Action<TSignalValue, TValue> = TValue extends [void]
	? () => Promise<TSignalValue>
	: [unknown] extends TValue
	? () => Promise<TSignalValue>
	: (
			value: TValue extends [infer TInferred]
				? TInferred | Observable<TInferred>
				: TValue | Observable<TValue>
	  ) => Promise<TSignalValue>;

type ActionMethod<
	TSignalValue,
	TActionSource extends NamedActionSources<TSignalValue>[string]
> = TActionSource extends (
	state: Signal<TSignalValue>,
	value: Observable<infer TObservableValue>
) => any
	? Action<TSignalValue, [TObservableValue]>
	: TActionSource extends Subject<infer TSubjectValue>
	? Action<TSignalValue, [TSubjectValue]>
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

type NamedActionEffects<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>
> = Partial<{
	[K in keyof TActionSources]: (action: ActionEffectTrigger) => void;
}>;

export type Source<TSignalValue> = Observable<PartialOrValue<TSignalValue>>;

export type SignalSlice<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects,
	TActionEffects extends NamedActionEffects<TSignalValue, TActionSources>
> = Signal<TSignalValue> &
	Selectors<TSignalValue> &
	ExtraSelectors<TSelectors> &
	Effects<TEffects> &
	ActionEffects<TSignalValue, TActionEffects> &
	ActionMethods<TSignalValue, TActionSources> &
	ActionStreams<TSignalValue, TActionSources>;

export function signalSlice<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects,
	TActionEffects extends NamedActionEffects<TSignalValue, TActionSources>
>(config: {
	initialState: TSignalValue;
	sources?: Array<
		| Source<TSignalValue>
		| ((state: Signal<TSignalValue>) => Source<TSignalValue>)
	>;
	actionSources?: TActionSources;
	selectors?: (state: Signal<TSignalValue>) => TSelectors;
	effects?: (
		state: SignalSlice<
			TSignalValue,
			TActionSources,
			TSelectors,
			any,
			TActionEffects
		>
	) => TEffects;
	actionEffects?: (
		state: SignalSlice<
			TSignalValue,
			TActionSources,
			TSelectors,
			any,
			TActionEffects
		>
	) => TActionEffects;
}): SignalSlice<
	TSignalValue,
	TActionSources,
	TSelectors,
	TEffects,
	TActionEffects
> {
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
		actionEffects = (() => ({})) as unknown as Exclude<
			(typeof config)['actionEffects'],
			undefined
		>,
	} = config;

	const state = signal(initialState);
	const readonlyState = state.asReadonly();
	const state$ = toObservable(state);

	const subs: Subject<any>[] = [];

	const slice = readonlyState as SignalSlice<
		TSignalValue,
		TActionSources,
		TSelectors,
		TEffects,
		TActionEffects
	>;

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
		const effectTrigger = new Subject<ActionEffectTrigger>();
		subs.push(effectTrigger);

		if (isObservable(actionSource)) {
			addReducerProperties(
				readonlyState,
				state$,
				key,
				destroyRef,
				actionSource,
				subs,
				effectTrigger
			);
		} else {
			const subject = new Subject();
			const observable = actionSource(readonlyState, subject);
			const sharedObservable = observable.pipe(share());
			connect(state, sharedObservable);
			addReducerProperties(
				readonlyState,
				state$,
				key,
				destroyRef,
				subject,
				subs,
				effectTrigger,
				sharedObservable
			);
		}

		const actionEffectFns = actionEffects(slice);

		effectTrigger.subscribe((action) => {
			const effectFn = actionEffectFns[action.name];
			if (effectFn) {
				effectFn(action);
			}
		});
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
	subs: Subject<unknown>[],
	effectTrigger: Subject<ActionEffectTrigger>,
	observableFromActionSource?: Observable<any>
) {
	Object.defineProperties(readonlyState, {
		[key]: {
			value: (nextValue: unknown) => {
				if (isObservable(nextValue)) {
					return new Promise((res, rej) => {
						nextValue.pipe(takeUntilDestroyed(destroyRef)).subscribe({
							next: (value) => {
								effectTrigger.next({
									name: key,
									payload: nextValue,
									value,
									err: undefined,
								});
								subject.next(value);
							},
							error: (err) => {
								effectTrigger.next({
									name: key,
									payload: nextValue,
									value: undefined,
									err,
								});
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

				if (observableFromActionSource) {
					observableFromActionSource
						.pipe(takeUntilDestroyed(destroyRef))
						.subscribe({
							next: (value) => {
								effectTrigger.next({
									name: key,
									payload: nextValue,
									value,
									err: undefined,
								});
							},
							error: (err) => {
								effectTrigger.next({
									name: key,
									payload: nextValue,
									value: undefined,
									err,
								});
							},
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
