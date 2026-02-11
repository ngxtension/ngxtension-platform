import {
	DestroyRef,
	Injector,
	isDevMode,
	runInInjectionContext,
	Signal,
	signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

export type OnEventOptions = {
	once?: boolean;
	capture?: boolean;
	passive?: boolean;
} & (
	| {
			destroyRef?: DestroyRef;
			injector?: never;
			manualCleanup?: false | null | undefined;
	  }
	| {
			destroyRef?: never;
			injector?: Injector;
			manualCleanup?: false | null | undefined;
	  }
	| {
			destroyRef?: never;
			injector?: never;
			manualCleanup?: true;
	  }
);

const DEFAULT_ON_EVENT_OPTIONS: OnEventOptions = {
	once: false,
	capture: false,
	passive: false,
	manualCleanup: false,
};

/** Result of the `onEvent()` function. Contains the `removeListener()` function to remove the listener and the `active` signal to check if the listener is still active.*/
export type OnEventRef = {
	removeListener: () => void;
	active: Signal<boolean>;
};

function getDestroyRef(options?: OnEventOptions): DestroyRef | null {
	if (options?.manualCleanup) return null;
	if (options?.destroyRef) return options.destroyRef;

	const injector = assertInjector(onEvent, options?.injector);

	return runInInjectionContext(injector, () => injector.get(DestroyRef));
}

export function onEvent<
	K extends string,
	E extends K extends keyof GlobalEventHandlersEventMap
		? GlobalEventHandlersEventMap[K]
		: Event,
>(
	target: EventTarget,
	eventKey: K,
	listener: (event: E, abort: () => void) => void,
	options?: OnEventOptions,
): OnEventRef;

export function onEvent<E extends Event>(
	target: EventTarget,
	eventKey: string,
	listener: (event: E, abort: () => void) => void,
	options?: OnEventOptions,
): OnEventRef;

export function onEvent<E extends Event>(
	target: EventTarget,
	eventKey: string,
	listener: (event: E, abort: () => void) => void,
	options: OnEventOptions = DEFAULT_ON_EVENT_OPTIONS,
): OnEventRef {
	const destroyRef = getDestroyRef(options);
	if (!destroyRef && isDevMode()) {
		console.warn(
			`onEvent: No DestroyRef could be determined. The event listener will not be automatically removed on destroy.`,
			{
				target,
				eventKey,
			},
		);
	}
	const abortController = new AbortController();
	const listenerActive = signal(true);

	const abort = () => {
		abortController.abort();
		listenerActive.set(false);
		// Prevent memory leak: Remove the onDestroy listener if aborted manually
		unregisterDestroyCallback?.();
	};

	// Register cleanup and store the unregister function
	const unregisterDestroyCallback = destroyRef?.onDestroy(() => {
		abort();
	});

	const eventListener = (event: Event) => {
		if (options?.once) {
			listenerActive.set(false);
			// Also cleanup the destroyRef listener since we don't need it anymore
			unregisterDestroyCallback?.();
		}

		listener(event as E, abort);
	};

	target.addEventListener(eventKey, eventListener, {
		signal: abortController.signal,
		once: options?.once,
		capture: options?.capture,
		passive: options?.passive,
	});

	return {
		removeListener: () => abort(),
		active: listenerActive.asReadonly(),
	};
}
