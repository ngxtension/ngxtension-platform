import { InjectionToken } from '@angular/core';

interface SignalRouteInjectionOptions {
	/**
	 * By default, ActivatedRoute.params and ActivatedRoute.queryParams are synchronous.
	 * However, in some cases, they may be asynchronous, for example when using a custom router-outlet implementation.
	 *
	 * If you set this option to false, the functions will return null as initial value if the value is not available synchronously.
	 */
	requireSync?: boolean;
}

const defaultSignalRouteInjectionOptions: SignalRouteInjectionOptions = {
	requireSync: true,
};

export const NGXTENSION_SIGNAL_ROUTE_INJECTION_TOKEN =
	new InjectionToken<SignalRouteInjectionOptions>(
		'NGXTENSION_SIGNAL_ROUTE_INJECTION_TOKEN',
		{
			providedIn: 'root',
			factory: () => defaultSignalRouteInjectionOptions,
		},
	);

/**
 * Provides the `SIGNAL_ROUTE_INJECTION_TOKEN` with the specified options.
 *
 * This is useful when you want to use these functions:
 * - `injectParams`
 * - `injectQueryParams`
 *
 * in a context where the ActivatedRoute is patched, for example by Ionic which uses a custom router-outlet implementation.
 *
 * @param options
 */
export const provideSignalRouteInjections = (
	options?: SignalRouteInjectionOptions,
) => {
	return {
		provide: NGXTENSION_SIGNAL_ROUTE_INJECTION_TOKEN,
		useValue: { ...defaultSignalRouteInjectionOptions, ...options },
	};
};
