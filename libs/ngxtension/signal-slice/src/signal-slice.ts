import {
	DestroyRef,
	Injector,
	computed,
	effect,
	inject,
	signal,
	type EffectRef,
	type Signal,
	type WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { connect, type PartialOrValue, type Reducer } from 'ngxtension/connect';
import { Subject, isObservable, share, take, type Observable } from 'rxjs';

type ActionSourceFn<TSignalValue, TPayload> = (
	state: Signal<TSignalValue>,
	value: TPayload,
) => Observable<PartialOrValue<TSignalValue>>;

type NoOptionalProperties<T> = {
	[P in keyof T]-?: T[P];
};

type NamedActionSources<TSignalValue> = {
	[actionName: string]: Subject<any> | ActionSourceFn<TSignalValue, any>;
};

type NamedSelectors = {
	[selectorName: string]: () => any;
};

type Selectors<TSignalValue> = {
	[K in keyof TSignalValue]: Signal<TSignalValue[K]>;
};

type ExtraSelectors<TSelectors extends NamedSelectors> = {
	[K in keyof TSelectors]: Signal<ReturnType<TSelectors[K]>>;
};

type NamedEffects = {
	[selectorName: string]: () => void | (() => void);
};

type Effects<TEffects extends NamedEffects> = {
	[K in keyof TEffects]: EffectRef;
};

type InferPayload<T> = T extends ActionSourceFn<any, infer TPayload>
	? TPayload
	: never;

type ActionSourcePayloadType<TActionSource> = InferPayload<TActionSource>;

type ActionSourceReturnType<TActionSource> = TActionSource extends (
	state: any,
	value: any,
) => Observable<infer TValue>
	? TValue
	: never;

type NamedActionEffects<TActionSources> = Partial<{
	[K in keyof TActionSources]: (action: {
		name: K;
		payload: ActionSourcePayloadType<TActionSources[K]>;
		value: ActionSourceReturnType<TActionSources[K]>;
		err: any;
	}) => void;
}>;

type ActionEffects<TActionSources> = NamedActionEffects<TActionSources>;

type Action<TSignalValue, TValue> = TValue extends [void]
	? () => Promise<TSignalValue>
	: [unknown] extends TValue
	  ? () => Promise<TSignalValue>
	  : (
				value: TValue extends [infer TInferred]
					? TInferred | Observable<TInferred>
					: TValue | Observable<TValue>,
	    ) => Promise<TSignalValue>;

type ActionMethod<
	TSignalValue,
	TActionSource extends NamedActionSources<TSignalValue>[string],
> = TActionSource extends (
	state: Signal<TSignalValue>,
	value: Observable<infer TObservableValue>,
) => any
	? Action<TSignalValue, [TObservableValue]>
	: TActionSource extends Subject<infer TSubjectValue>
	  ? Action<TSignalValue, [TSubjectValue]>
	  : never;

type ActionMethods<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>,
> = {
	[K in keyof TActionSources]: ActionMethod<TSignalValue, TActionSources[K]>;
};

type ActionStreams<
	TSignalValue,
	TActionSources extends NamedActionSources<TSignalValue>,
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
type SourceConfig<TSignalValue> = Array<
	Source<TSignalValue> | ((state: Signal<TSignalValue>) => Source<TSignalValue>)
>;

export type SignalSlice<
	TSignalValue extends NoOptionalProperties<TSignalValue>,
	TActionSources extends NamedActionSources<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects,
	TActionEffects extends NamedActionEffects<TActionSources>,
> = Signal<TSignalValue> &
	Selectors<TSignalValue> &
	ExtraSelectors<TSelectors> &
	Effects<TEffects> &
	ActionEffects<TActionEffects> &
	ActionMethods<TSignalValue, TActionSources> &
	ActionStreams<TSignalValue, TActionSources>;

export function signalSlice<
	TSignalValue extends NoOptionalProperties<TSignalValue>,
	TActionSources extends NamedActionSources<TSignalValue>,
	TSelectors extends NamedSelectors,
	TEffects extends NamedEffects,
	TActionEffects extends NamedActionEffects<TActionSources>,
>(config: {
	initialState: TSignalValue;
	sources?: SourceConfig<TSignalValue>;
	lazySources?: SourceConfig<TSignalValue>;
	actionSources?: TActionSources;
	selectors?: (
		state: SignalSlice<
			TSignalValue,
			TActionSources,
			any,
			TEffects,
			TActionEffects
		>,
	) => TSelectors;
	effects?: (
		state: SignalSlice<
			TSignalValue,
			TActionSources,
			TSelectors,
			any,
			TActionEffects
		>,
	) => TEffects;
	actionEffects?: (
		state: SignalSlice<
			TSignalValue,
			TActionSources,
			TSelectors,
			any,
			TActionEffects
		>,
	) => TActionEffects;
}): SignalSlice<
	TSignalValue,
	TActionSources,
	TSelectors,
	TEffects,
	TActionEffects
> {
	const destroyRef = inject(DestroyRef);
	const injector = inject(Injector);

	const {
		initialState,
		sources = [],
		lazySources = [],
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
	let lazySourcesLoaded = false;

	const subs: Subject<any>[] = [];

	const slice = readonlyState as SignalSlice<
		TSignalValue,
		TActionSources,
		TSelectors,
		TEffects,
		TActionEffects
	>;

	connectSources(state, sources);

	for (const [key, actionSource] of Object.entries(
		actionSources as TActionSources,
	)) {
		const effectTrigger = new Subject<any>();
		subs.push(effectTrigger);

		if (isObservable(actionSource)) {
			addReducerProperties(
				readonlyState,
				state$,
				key,
				destroyRef,
				actionSource,
				subs,
				effectTrigger,
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
				sharedObservable,
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

	for (const [key, selector] of Object.entries(selectors(slice))) {
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

	const connectLazySources = () => {
		if (!lazySourcesLoaded) {
			lazySourcesLoaded = true;
			connectSources(state, lazySources, injector, true);
		}
	};

	return new Proxy(slice, {
		get(target, property, receiver) {
			connectLazySources();
			return Reflect.get(target, property, receiver);
		},
		apply(target, thisArg, argumentsList) {
			connectLazySources();
			return Reflect.apply(target, thisArg, argumentsList);
		},
	});
}

function connectSources<TSignalValue>(
	state: WritableSignal<TSignalValue>,
	sources: SourceConfig<TSignalValue>,
	injector?: Injector,
	useUntracked = false,
) {
	for (const source of sources) {
		if (isObservable(source)) {
			connect(state, source, injector, useUntracked);
		} else {
			connect(state, source(state.asReadonly()), injector, useUntracked);
		}
	}
}

function addReducerProperties(
	readonlyState: Signal<unknown>,
	state$: Observable<unknown>,
	key: string,
	destroyRef: DestroyRef,
	subject: Subject<unknown>,
	subs: Subject<unknown>[],
	effectTrigger: Subject<any>,
	observableFromActionSource?: Observable<any>,
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
