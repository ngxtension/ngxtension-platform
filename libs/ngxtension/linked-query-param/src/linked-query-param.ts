import {
	computed,
	effect,
	inject,
	Injectable,
	InjectionToken,
	Injector,
	isSignal,
	Provider,
	runInInjectionContext,
	Signal,
	signal,
	untracked,
	ValueEqualityFn,
	WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	ActivatedRoute,
	NavigationExtras,
	Params,
	Router,
} from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import { createNotifier } from 'ngxtension/create-notifier';

import { computedPrevious } from 'ngxtension/computed-previous';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { distinctUntilKeyChanged, map } from 'rxjs';

/**
 * The type of the stringified value.
 * After transforming the value before it is passed to the query param, this type will be used.
 */
type StringifyReturnType = string | number | boolean | null | undefined;

type QueryParamKeyType =
	| string
	| Signal<string | undefined>
	| (() => string | undefined);

/**
 * These are the options that can be passed to the `linkedQueryParam` function.
 * They are taken from the `NavigationExtras` type in the `@angular/router` package.
 */
type NavigateMethodFields = Pick<
	NavigationExtras,
	| 'queryParamsHandling'
	| 'onSameUrlNavigation'
	| 'replaceUrl'
	| 'skipLocationChange'
	| 'preserveFragment'
>;

const defaultConfig: Partial<NavigateMethodFields> &
	LinkedQueryParamOptions<string> = {
	queryParamsHandling: 'merge',
	automaticallySynchronizeOnKeyChange: true,
};

const _LINKED_QUERY_PARAM_CONFIG_TOKEN = new InjectionToken<
	Partial<NavigateMethodFields> &
		Exclude<LinkedQueryParamOptions<string>, 'injector' | 'equal' | 'source'>
>('LinkedQueryParamConfig', {
	providedIn: 'root',
	factory: () => defaultConfig,
});

/*
 * This function allows users to override the default behavior of the `linkedQueryParam` navigation extras per component.
 *
 * @example
 * ```ts
 * @Component({
 *   providers: [
 *     provideLinkedQueryParamConfig({ preserveFragment: true })
 *   ]
 * })
 * export class MyComponent {
 *   // No matter which query param changes, the `preserveFragment` option
 *   // will be set to `true` for all the `linkedQueryParam` functions in this component.
 *   readonly searchQuery = linkedQueryParam('searchQuery');
 *   readonly page = linkedQueryParam('page');
 * }
 * ```
 *
 * As always, you can override this behavior on a per-function basis by passing the navigation extras to the `linkedQueryParam` function.
 *
 */
export function provideLinkedQueryParamConfig(
	config: Partial<NavigateMethodFields>,
): Provider {
	return {
		provide: _LINKED_QUERY_PARAM_CONFIG_TOKEN,
		useValue: { ...defaultConfig, ...config },
	};
}

/**
 * Service to coalesce multiple navigation calls into a single navigation event.
 */
@Injectable({ providedIn: 'root' })
export class LinkedQueryParamGlobalHandler {
	private _router = inject(Router);
	/**
	 * @internal
	 * The current query params that will be set on the next navigation event.
	 */
	private _currentKeys: Record<string, StringifyReturnType> = {};
	/**
	 * @internal
	 * The navigation extras that will be used on the next navigation event.
	 */
	private _navigationExtras: NavigationExtras = {};
	/**
	 * @internal
	 * The notifier that will be used to schedule the navigation event.
	 */
	private _schedulerNotifier = createNotifier();

	constructor() {
		effect(() => {
			// listen to the scheduler notifier to schedule the navigation event
			// we wrap the listen in a condition (listen() default value is 0) in order to not schedule
			// the first navigation event by default, because only changes should trigger it
			if (this._schedulerNotifier.listen()) {
				// we need to untrack the navigation call in order to not register any other signal as a dependency
				untracked(() => void this.navigate());
			}
		});
	}

	/**
	 * Schedules the navigation event.
	 */
	scheduleNavigation() {
		this._schedulerNotifier.notify();
	}

	/**
	 * Sets the value of a query param.
	 * This will be used on the next navigation event.
	 */
	setParamKeyValue(key: string, value: StringifyReturnType) {
		this._currentKeys[key] = value;
	}

	/**
	 * Sets the navigation extras that will be used on the next navigation event.
	 */
	setCurrentNavigationExtras(config: Partial<NavigateMethodFields> = {}) {
		const {
			queryParamsHandling,
			onSameUrlNavigation,
			replaceUrl,
			skipLocationChange,
			preserveFragment,
		} = config;
		if (queryParamsHandling || queryParamsHandling === '') {
			this._navigationExtras.queryParamsHandling = queryParamsHandling;
		}
		if (onSameUrlNavigation) {
			this._navigationExtras.onSameUrlNavigation = onSameUrlNavigation;
		}
		if (replaceUrl) {
			this._navigationExtras.replaceUrl = replaceUrl;
		}
		if (skipLocationChange) {
			this._navigationExtras.skipLocationChange = skipLocationChange;
		}
		if (preserveFragment) {
			this._navigationExtras.preserveFragment = preserveFragment;
		}
	}

	/**
	 * Navigates to the current URL with the accumulated query parameters and navigation extras.
	 * Cleans up the current keys and navigation extras after the navigation.
	 */
	private navigate(): Promise<boolean> {
		return this._router
			.navigate([], {
				queryParams: this._currentKeys,
				...this._navigationExtras, // override the navigation extras
			})
			.then((value) => {
				// we reset the current keys and navigation extras on navigation
				// in order to avoid leaking to other navigations
				this._currentKeys = {};
				this._navigationExtras = {};
				return value;
			});
	}
}

type LinkedQueryParamOptions<T> = {
	/**
	 * The injector to use to inject the router and activated route.
	 */
	injector?: Injector;

	/**
	 * A comparison function which defines equality for signal values.
	 */
	equal?: ValueEqualityFn<T>;

	/**
	 * The source signal to use to update the query param when it changes (two-way binding between this source and the query param).
	 */
	source?: WritableSignal<T>;

	/**
	 * Controls whether the query param value should be synchronized with the source signal when the key changes.
	 * When true, if the key changes (e.g. from 'key1' to 'key2'), the value from the source signal will be used to set the new query param.
	 * When false, the new query param will be initialized as null/undefined when the key changes.
	 * Default is true.
	 *
	 * This is useful when you want to preserve the source signal's value across key changes, rather than resetting the query param.
	 */
	automaticallySynchronizeOnKeyChange?: boolean;
} & Partial<NavigateMethodFields>;

/**
 * These are the function types that will be used to parse and stringify the query param value.
 */
type ParseFn<T> = (value: string | null) => T;
type StringifyFn<T> = (value: T) => StringifyReturnType;

/**
 *These types will be used to define the return types of the `set` and `update` methods of the signal.
 * We need to re-type the WritableSignal, so that the set and update methods can have null in the call signature.
 * But the WritableSignal itself won't have null in the call signature, so we need to re-type it.
 * This is needed in order to be able to reset the value to null,
 * which is not possible with the WritableSignal that doesn't have null in it's type.
 */
type SignalSetFn<T> = (value: T) => void;
type SignalUpdateFn<T> = (fn: (value: T) => T) => void;

/**
 * Creates a signal that is linked to a query parameter.
 *
 * You can parse the query param value before it is passed to the signal, this way you can transform the value from a string to a number or boolean or whatever you need.
 * You can also stringify the value before it is passed to the query param, this way you can stringify the value from a number or boolean or object to a string or null.
 *
 * You can also use the `defaultValue` option to set a default value if the query param is not present in the url (null or undefined).
 * NOTE: You cannot use both `defaultValue` and `parse` at the same time. You should use `parse` instead to handle the default value.
 *
 * You can set the signal to update the query parameter by calling the `set` or `update` method.
 * Both methods will accept the value + null as a valid value, so you can remove the query parameter by passing null if needed.
 *
 * The 'set' and 'update' methods will update the value synchronously, but will schedule the navigation event to
 * happen on the next tick (using root effect scheduling). This means the query params will be updated asynchronously.
 * The changes will be coalesced into a single navigation event. This means that if you call `set` or `update` multiple times
 * in a row (synchronously), only the last value will be updated in the query params.
 *
 * If you have multiple signals listening to the same query parameter, they will all be updated when the navigation event happens.
 *
 * @param key The name of the query parameter.
 * @param options Configuration options for the signal.
 * @returns A signal that is linked to the query parameter.
 */
export function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & {
		parse: ParseFn<T>;
		stringify: StringifyFn<T>;
	},
): WritableSignal<T> & {
	set: SignalSetFn<T | null>;
	update: SignalUpdateFn<T | null>;
};

/**
 * You cannot use both `defaultValue` and `parse` at the same time.
 * You should use `parse` instead to handle the default value.
 *
 * For example, you cannot do this:
 *
 * ```ts
 * linkedQueryParam('param', { defaultValue: 1, parse: (x) => x ? parseInt(x, 10) : x });
 * ```
 *
 * Instead, you should do this:
 *
 * ```ts
 * linkedQueryParam('param', { parse: (x) => x ? parseInt(x, 10) : 1 });
 * ```
 */
export function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & {
		defaultValue: Exclude<T, undefined> | (() => Exclude<T, undefined>);
		parse: ParseFn<T>;
		stringify?: StringifyFn<T>;
	},
): never;

export function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & {
		defaultValue: T | (() => T);
		stringify: StringifyFn<T>;
	},
): WritableSignal<T | null>;

export function linkedQueryParam<T>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & { defaultValue: T | (() => T) },
): WritableSignal<T> & {
	set: SignalSetFn<T | null>;
	update: SignalUpdateFn<T | null>;
};

export function linkedQueryParam<T>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & {
		defaultValue: T | (() => T) | (() => T | null) | null;
	},
): WritableSignal<T | null>;

export function linkedQueryParam<T>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & {
		defaultValue: T | (() => T) | (() => T | undefined) | undefined;
	},
): WritableSignal<T | undefined>;

export function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & { defaultValue: undefined },
): WritableSignal<T | null>;

export function linkedQueryParam<T>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & { parse: ParseFn<T> },
): WritableSignal<T> & {
	set: SignalSetFn<T | null>;
	update: SignalUpdateFn<T | null>;
};

export function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T> & { stringify: StringifyFn<T> },
): WritableSignal<T | null>;

export function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
	options: LinkedQueryParamOptions<T>,
): WritableSignal<T | null>;

export function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
): WritableSignal<T | null>;

export function linkedQueryParam<T>(
	key: QueryParamKeyType,
	options?: LinkedQueryParamOptions<T> & {
		defaultValue?: T | (() => T);
		parse?: ParseFn<T>;
		stringify?: StringifyFn<T>;
		source?: WritableSignal<T>;
		automaticallySynchronizeOnKeyChange?: boolean;
	},
): WritableSignal<T> {
	if (options?.defaultValue !== undefined && options?.parse) {
		throw new Error(
			'linkedQueryParam: You cannot have both defaultValue and parse at the same time!',
		);
	}

	const injector = assertInjector(linkedQueryParam, options?.injector);

	return runInInjectionContext(injector, () => {
		const route = inject(ActivatedRoute);
		const globalHandler = inject(LinkedQueryParamGlobalHandler);
		const config = inject(_LINKED_QUERY_PARAM_CONFIG_TOKEN);

		// create a signal updated whenever the query param changes
		// const queryParamValue = signal(parseParamValue(route.snapshot.queryParams, key, options));

		// We have a dynamic key, so everytime the key changes, we need to make sure we remove the old one from the the params
		const queryParamKey = computed(() => getCurrentKey(key));
		// We keep track of the previous queryParam key to remove the old one from the params
		const previousQueryParamKey = computedPrevious(queryParamKey);

		const parsedInitialValue = parseParamValue(
			route.snapshot.queryParams,
			queryParamKey(),
			options,
		);

		let source!: WritableSignal<T>;

		if (options?.source) {
			source = options.source;
			source.set(parsedInitialValue as T); // set the initial value to the initial value from the query param
		} else {
			source = signal<T>(parsedInitialValue as T, {
				equal: options?.equal ?? undefined,
				debugName: `linkedQueryParam-${queryParamKey()}`,
			});
		}

		// we need to keep a reference to the original set function
		// so we can use it to update the source signal whenever the query param changes
		const sourceSignalSetMethod: (value: T) => void = source.set;

		// By subscribing directly to the queryParams, we know this subscription is synchronous
		// So we don't have to depend on another effect to synchronise the values between params and source signal
		route.queryParams
			.pipe(
				distinctUntilKeyChanged(queryParamKey()), // skip if no changes on same key
				map((queryParams) =>
					parseParamValue(queryParams, queryParamKey(), options),
				),
				takeUntilDestroyed(),
			)
			.subscribe((value) => {
				if (value === source() && !options?.equal) {
					return;
				}

				// we want to call the source set method only when
				// - the equal function is not provided or
				// - when the value is different from the current source value
				sourceSignalSetMethod(value as T);
			});

		const setSourceValueAndScheduleNavigation = (value: T) => {
			// first we check if the value is undefined or null so we can set the default value instead
			if (
				(value === undefined || value === null) &&
				options?.defaultValue !== undefined
			) {
				value = getValue(options.defaultValue);
			}

			// we first set the initial value so it synchronous (same as a normal signal)
			sourceSignalSetMethod(value);

			// when the source signal changes, update the query param
			// store the new value in the current keys so that we can coalesce the navigation
			let valueToBeSet: any = value;
			if (options?.stringify) {
				valueToBeSet = options.stringify(value);
			} else if (value === undefined || value === null) {
				valueToBeSet = null;
			} else {
				valueToBeSet = typeof value === 'string' ? value : String(value);
			}

			if (queryParamKey() !== previousQueryParamKey()) {
				// remove the previous query param if it's different from the current one
				// this way the url is cleaned up and also the update is scheduled on the same tick as the current one
				// NOTE: If the user wants to set a value on the previous queryParam key,
				// they should do it synchronously after setting this linkedQueryParam value (check setParamKeyValue for more)
				globalHandler.setParamKeyValue(previousQueryParamKey(), null);
			}

			globalHandler.setParamKeyValue(queryParamKey(), valueToBeSet);
			globalHandler.setCurrentNavigationExtras({
				...defaultConfig,
				...config,
				...(options ?? {}),
			});

			// schedule the navigation event (multiple synchronous navigations will be coalesced)
			// this will also reset the current keys and navigation extras after the navigation
			globalHandler.scheduleNavigation();
		};

		const update = (fn: (value: T) => T) =>
			setSourceValueAndScheduleNavigation(fn(source()));

		if (options?.source) {
			// When the source signal changes from outside
			// (lets say someone changes the form field and doesn't use the signal returned from linkedQueryParam),
			// we want to schedule a navigation event to update the query param
			// We use defer to skip the initial effect run as the initial value is already handled
			explicitEffect(
				[options.source],
				([value]) => {
					if (value === source()) return;
					setSourceValueAndScheduleNavigation(value as T);
				},
				{ defer: true },
			);
		}

		const automaticallySynchronizeOnKeyChange =
			options?.automaticallySynchronizeOnKeyChange ??
			config.automaticallySynchronizeOnKeyChange;

		if (automaticallySynchronizeOnKeyChange && isSignalOrFunction(key)) {
			// we want to register the effect when the key is dynamic and the automaticallySynchronizeOnKeyChange is true
			explicitEffect(
				[queryParamKey],
				() => {
					// only when queryParamKey changes we want to schedule a navigation
					setSourceValueAndScheduleNavigation(source() as T);
				},
				{ defer: true },
			);
		}

		return Object.assign(source, {
			set: setSourceValueAndScheduleNavigation,
			update,
		});
	});
}

const getValue = <T>(value: T | (() => T) | Signal<T>) => {
	if (isSignal(value)) {
		return value();
	}
	if (value && typeof value === 'function') {
		return (value as () => T)();
	}
	return value;
};

const isSignalOrFunction = <T>(value: T | (() => T) | Signal<T>) => {
	return isSignal(value) || typeof value === 'function';
};

// Get the current key value or throw an error if it's null or undefined
const getCurrentKey = (key: QueryParamKeyType): string => {
	const queryParamName = getValue(key);
	if (queryParamName === undefined) {
		throw new Error(
			'ngxtension/linkedQueryParam: key cannot be null or undefined',
		);
	}
	return queryParamName;
};

/**
 * Parses a parameter value based on provided configuration.
 * @param key
 * @param options
 * @param params - An object containing parameters.
 * @returns The parsed parameter value.
 */
const parseParamValue = <T>(
	params: Params,
	key: string,
	options?: LinkedQueryParamOptions<T> & {
		defaultValue?: T | (() => T);
		parse?: ParseFn<T>;
		stringify?: StringifyFn<T>;
	},
) => {
	// Get the value from the params object.
	const value: string | null = params[key] ?? null;
	// If a parsing function is provided in the config, use it to parse the value.
	if (options?.parse) {
		return options.parse(value);
	}
	// If the value is undefined or null and a default value is provided, return the default value.
	if (
		(value === undefined || value === null) &&
		options?.defaultValue !== undefined
	) {
		return getValue(options.defaultValue);
	}
	// Otherwise, return the original value or the parsed value (if it was parsed).
	return value;
};

/**
 * Can be used to parse a query param value to a number.
 * You can also use the `defaultValue` option to set a default value if the query param is not present in the url (null or undefined).
 *
 * Example:
 * ```ts
 * linkedQueryParam('page', { parse: paramToNumber() });
 * ```
 * Will return null if the query param is not present in the url.
 *
 * Or with a default value:
 * ```ts
 * linkedQueryParam('page', { parse: paramToNumber({defaultValue: 1}) });
 * ```
 *
 * Will return 1 if the query param is not present in the url.
 */
export function paramToNumber(): (x: string | null) => number | null;
export function paramToNumber(config: {
	defaultValue: number;
}): (x: string | null) => number;

export function paramToNumber(
	config: { defaultValue?: number | null | undefined } = { defaultValue: null },
) {
	return (x: string | null) => {
		if (x === undefined || x === null) return config.defaultValue;
		const parsed = parseInt(x, 10);
		if (Number.isNaN(parsed)) return config.defaultValue;
		return parsed;
	};
}

/**
 * Can be used to parse a query param value to a boolean.
 * You can also use the `defaultValue` option to set a default value if the query param is not present in the url (null or undefined).
 *
 * Example:
 * ```ts
 * linkedQueryParam('showHidden', { parse: paramToBoolean() });
 * ```
 * Will return null if the query param is not present in the url or true/false if the query param is present.
 *
 * Or with a default value:
 * ```ts
 * linkedQueryParam('showHidden', { parse: paramToBoolean({defaultValue: true}) });
 * ```
 *
 * Will return true if the query param is not present in the url.
 * Otherwise, it will return whatever the query param value is.
 */
export function paramToBoolean(): (x: string | null) => boolean | null;
export function paramToBoolean(config: {
	defaultValue: boolean;
}): (x: string | null) => boolean;

export function paramToBoolean(
	config: { defaultValue?: boolean | null | undefined } = {
		defaultValue: null,
	},
) {
	return (x: string | null) =>
		x === undefined || x === null ? config.defaultValue : x === 'true';
}
