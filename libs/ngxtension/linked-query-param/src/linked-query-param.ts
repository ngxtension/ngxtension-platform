import {
	effect,
	inject,
	Injectable,
	InjectionToken,
	Injector,
	Provider,
	runInInjectionContext,
	Signal,
	signal,
	untracked,
	WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
	ActivatedRoute,
	NavigationExtras,
	Params,
	Router,
} from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import { createNotifier } from 'ngxtension/create-notifier';
import { explicitEffect } from 'ngxtension/explicit-effect';

import { map } from 'rxjs';

/**
 * The type of the stringified value.
 * After transforming the value before it is passed to the query param, this type will be used.
 */
type StringifyReturnType = string | number | boolean | null | undefined;

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

const defaultConfig: Partial<NavigateMethodFields> = {
	queryParamsHandling: 'merge',
};

const _LINKED_QUERY_PARAM_CONFIG_TOKEN = new InjectionToken<
	Partial<NavigateMethodFields>
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
		useValue: config,
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

type LinkedQueryParamOptions = {
	/**
	 * The injector to use to inject the router and activated route.
	 */
	injector?: Injector;
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

type QueryParamKey =
	| string
	| Signal<string | undefined>
	| (() => string | undefined);

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
	key: QueryParamKey,
	options?: LinkedQueryParamOptions & {
		defaultValue?: T;
		parse?: ParseFn<T>;
		stringify?: StringifyFn<T>;
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

		// Get the current key value
		const getCurrentKey = () => {
			return isSignal(key) ? key() : key;
		};

		const parseParamValue = (params: Params) => {
			const currentKey = getCurrentKey();
			// If key is undefined (from a computed signal), return null or default value
			if (currentKey === undefined) {
				return options?.defaultValue ?? null;
			}
			const value: string | null = params[currentKey] ?? null;
			if (options?.parse) {
				return options.parse(value);
			}
			if (
				(value === undefined || value === null) &&
				options?.defaultValue !== undefined
			) {
				return options.defaultValue;
			}
			return value;
		};

		// Create a signal that combines both the key changes and query param changes
		const queryParamValue = toSignal(
			route.queryParams.pipe(map((params) => parseParamValue(params))),
			{ initialValue: parseParamValue(route.snapshot.queryParams) },
		);

		const source = signal<T>(queryParamValue() as T);

		const originalSet = source.set;

		explicitEffect([queryParamValue], ([value]) => {
			// update the source signal whenever the query param changes
			originalSet(value as T);
		});

		const set = (value: T) => {
			const currentKey = getCurrentKey();
			// Don't update query params if key is undefined
			if (currentKey === undefined) {
				originalSet(value);
				return;
			}

			if (
				(value === undefined || value === null) &&
				options?.defaultValue !== undefined
			) {
				value = options.defaultValue;
			}

			originalSet(value);

			let valueToBeSet: any = value;
			if (options?.stringify) {
				valueToBeSet = options.stringify(value);
			} else if (value === undefined || value === null) {
				valueToBeSet = null;
			} else {
				valueToBeSet = typeof value === 'string' ? value : String(value);
			}

			globalHandler.setParamKeyValue(currentKey, valueToBeSet);
			globalHandler.setCurrentNavigationExtras({
				...defaultConfig,
				...config,
				...(options ?? {}),
			});

			// schedule the navigation event (multiple synchronous navigations will be coalesced)
			// this will also reset the current keys and navigation extras after the navigation
			globalHandler.scheduleNavigation();
		};

		const update = (fn: (value: T) => T) => set(fn(source()));

		return Object.assign(source, { set, update });
	});
}

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
