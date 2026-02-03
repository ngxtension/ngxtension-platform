import {
	DestroyRef,
	inject,
	Injector,
	isDevMode,
	Signal,
	signal,
} from '@angular/core';

export type OnEventOptions = {
	once?: boolean;
	capture?: boolean;
	passive?: boolean;
} & (
	| {
			destroyRef?: DestroyRef;
			injector?: never;
	  }
	| {
			destroyRef?: never;
			injector?: Injector;
	  }
);

/** Result of the `onEvent()` function. Contains the `removeListener()` function to remove the listener and the `active` signal to check if the listener is still active.*/
export type OnEventResult = {
	removeListener: () => void;
	active: Signal<boolean>;
};

function getDestroyRef(options?: OnEventOptions): DestroyRef | null {
	if (options?.destroyRef) return options.destroyRef;
	if (options?.injector) return options.injector.get(DestroyRef);

	try {
		return inject(DestroyRef, { optional: true });
	} catch {
		return null;
	}
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
): OnEventResult;

export function onEvent<E extends Event>(
	target: EventTarget,
	eventKey: string,
	listener: (event: E, abort: () => void) => void,
	options?: OnEventOptions,
): OnEventResult;

export function onEvent<E extends Event>(
	target: EventTarget,
	eventKey: string,
	listener: (event: E, abort: () => void) => void,
	options?: OnEventOptions,
): OnEventResult {
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
