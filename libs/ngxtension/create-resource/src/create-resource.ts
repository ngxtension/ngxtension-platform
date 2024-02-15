import {
	Injector,
	computed,
	effect,
	isSignal,
	signal,
	untracked,
	type Signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { computedPrevious } from 'ngxtension/computed-previous';

interface CreateResourceOptions {
	injector?: Injector;
}

export type CreateResourceSource<TValue> = Signal<TValue | undefined>;

export type CreateResourceStatus =
	| 'unresolved'
	| 'pending'
	| 'ready'
	| 'refreshing'
	| 'errored';

interface Resource<TValue, TError = string> {
	data: Signal<TValue>;
	status: Signal<CreateResourceStatus>;
	error: Signal<TError | undefined>;
	loading: Signal<boolean>;
	latest: Signal<TValue>;
	refetch: () => void;
	mutate: (value: TValue) => void;
	destroy: () => void;
}

// TODO: FIX types as they don't play well
// Add better naming for the types ex: sourceOrFetcher, fetcherOrOptions

// fetcher with options
export function createResource<TValue, TError = string>(
	fetcher: () => Promise<TValue>,
	options?: CreateResourceOptions & { initialValue?: undefined },
): Resource<TValue | undefined, TError>;

// fetcher with options + initial value
export function createResource<TValue, TError = string>(
	fetcher: () => Promise<TValue>,
	options: CreateResourceOptions & { initialValue: TValue },
): Resource<TValue, TError>;

// source + fetcher + options
export function createResource<TValue, TError = string>(
	source: Signal<TValue | undefined | null>,
	fetcher: (source: TValue | undefined) => Promise<TValue>,
	options?: CreateResourceOptions & { initialValue?: TValue },
): Resource<TValue | undefined, TError>;

// source + fetcher + options + initial value
export function createResource<TValue, TError = string>(
	source: Signal<TValue | undefined>,
	fetcher: (source: TValue | undefined) => Promise<TValue>,
	options: CreateResourceOptions & { initialValue: TValue },
): Resource<TValue, TError>;

export function createResource<TValue, TError = string>(
	source:
		| Signal<TValue | undefined>
		| ((source?: TValue | undefined) => Promise<TValue>),
	fetcher: (
		source: TValue | undefined,
	) => Promise<TValue> | (CreateResourceOptions & { initialValue: TValue }),
	options?: CreateResourceOptions & { initialValue?: undefined },
): Resource<TValue, TError>;

export function createResource<TValue, TError = string>(
	source: Signal<TValue> | ((source: TValue) => Promise<TValue>),
	fetcher: (
		source: TValue,
	) => Promise<TValue> | (CreateResourceOptions & { initialValue: TValue }),
	options: CreateResourceOptions & { initialValue: TValue },
): Resource<TValue, TError>;

/**
 *
 * This function creates a resource that can be used to fetch data from an API or any other source.
 * It returns an object with the following properties:
 * - data: a signal that contains the data
 * - status: a signal that contains the status of the resource
 * - error: a signal that contains the error if the resource is in an errored state
 * - loading: a signal that contains a boolean indicating if the resource is loading
 * - latest: a function that returns the latest value of the resource
 * - refetch: a function that refetches the resource
 * - mutate: a function that updates the value of the resource
 * - destroy: a function that destroys the resource
 *
 * @example
 *
 * getUser(id: string): Promise<User> {
 *   return fetch(`/api/users/${id}`).then(res => res.json());
 * }
 *
 * userId = injectQueryParam('userId');
 *
 * res = createResource(() => this.getUser(this.userId()));
 * or
 * res = createResource(this.userId, this.getUser);
 *
 * res.data() // returns undefined
 * res.loading() // returns true
 * res.error() // returns undefined
 * res.latest() // returns undefined
 *
 * // After the promise resolves
 *
 * res.data() // returns User
 * res.loading() // returns false
 * res.error() // returns undefined
 * res.latest() // returns User
 *
 * // After the promise rejects
 *
 * res.data() // returns undefined
 * res.loading() // returns false
 * res.error() // returns Error
 * res.latest() // returns undefined
 *
 * // After calling refetch
 *
 * res.data() // returns undefined
 * res.loading() // returns true
 * res.error() // returns undefined
 * res.latest() // returns User
 *
 * // After calling mutate
 *
 * res.data() // returns User
 * res.loading() // returns false
 * res.error() // returns undefined
 * res.latest() // returns User
 *
 *
 */
export function createResource<TValue, TError = string>(...args: unknown[]) {
	const { source, fetcher, options } = parseArgs<TValue>(args);

	if (fetcher === undefined) {
		throw new Error('fetcher is required');
	}

	const value = signal<TValue | undefined>(options.initialValue);
	const error = signal<TError | undefined>(undefined);
	const trigger = signal(0);
	const state = signal<CreateResourceStatus>(
		'initialValue' in options ? 'ready' : 'unresolved',
	);

	const latest = signal<TValue | undefined>(value());

	const previousTrigger = computedPrevious(trigger);

	return assertInjector(createResource, options.injector, () => {
		const effectRef = effect(() => {
			trigger(); // used to trigger the effect and for refetching

			const promise = source ? fetcher(source()) : fetcher();

			// we don't want to track anything else except the source and the fetcher
			untracked(() => {
				// TODO: do we want to cancel the current promise if it's still pending? it's easy with observables 😅
				load(promise!);
			});
		});

		function load(p: Promise<TValue> | undefined) {
			if (p && isPromise(p)) {
				if (state() === 'pending' || state() === 'refreshing') return;

				// if the trigger has changed, we want to refetch and set the state to refreshing
				if (trigger() !== previousTrigger()) {
					state.set('refreshing');
				} else {
					state.set('pending');
				}

				latest.set(value()); // store the latest value before the promise resolves
				value.set(undefined); // clear the value

				p.then(
					(v) => {
						value.set(v);
						latest.set(v);
						state.set('ready');
					},
					(e) => {
						error.set(e);
						state.set('errored');
					},
				);
			}
		}

		function refetch() {
			trigger.update((v) => v + 1);
		}

		// function destroy() {

		// }

		return {
			data: value.asReadonly(),
			status: state.asReadonly(),
			error: error.asReadonly(),
			loading: computed(
				() => state() === 'pending' || state() === 'refreshing',
			),
			latest: () => {
				if (state() === 'errored') {
					throw error();
				}
				return latest();
			},
			refetch,
			mutate: (newValue: TValue) => {
				value.set(newValue);
				latest.set(newValue);
			},
			destroy: () => {
				// TODO: we want to cancel the promise

				// we want to destroy the effect
				effectRef.destroy();
			},
		};
	});
}

function parseArgs<TValue>(args: unknown[]): {
	source: CreateResourceSource<TValue> | undefined;
	fetcher: (source?: TValue | undefined | null) => Promise<TValue> | undefined;
	options: any;
} {
	if (args.length === 1) {
		return {
			source: undefined,
			fetcher: args[0] as () => any,
			options: {} as CreateResourceOptions,
		};
	}
	if (args.length === 2) {
		if (isSignal(args[0])) {
			return {
				source: args[0] as CreateResourceSource<any>,
				fetcher: args[1] as () => any,
				options: {} as CreateResourceOptions,
			};
		} else {
			return {
				source: undefined,
				fetcher: args[0] as () => any,
				options: args[1] as CreateResourceOptions,
			};
		}
	}
	if (args.length === 3) {
		if (isSignal(args[0])) {
			return {
				source: args[0] as CreateResourceSource<any>,
				fetcher: args[1] as () => any,
				options: args[2] as CreateResourceOptions,
			};
		}
	}

	return {
		source: undefined,
		fetcher: () => undefined,
		options: {} as CreateResourceOptions,
	};
}

function isPromise<T>(value: any): value is Promise<T> {
	return value && typeof value.then === 'function';
}
