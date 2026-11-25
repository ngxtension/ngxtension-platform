import { DOCUMENT } from '@angular/common';
import { inject, signal, type Injector, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEvent } from 'rxjs';

// Ported from https://vueuse.org/core/useBroadcastChannel/

export interface InjectBroadcastChannelOptions {
	/**
	 * The name of the channel.
	 */
	name: string;
	/**
	 * Specify a custom `Window` instance, e.g. working with iframes or in testing environments.
	 */
	window?: Window;
	/**
	 * Specify a custom `Injector` instance for dependency injection.
	 */
	injector?: Injector;
}

export interface BroadcastChannelReturn<D, P> {
	/**
	 * Whether the BroadcastChannel API is supported.
	 */
	isSupported: Signal<boolean>;
	/**
	 * The BroadcastChannel instance.
	 */
	channel: Signal<BroadcastChannel | undefined>;
	/**
	 * The data received from the broadcast channel.
	 */
	data: Signal<D | undefined>;
	/**
	 * Post a message to the broadcast channel.
	 */
	post: (data: P) => void;
	/**
	 * Close the broadcast channel.
	 */
	close: () => void;
	/**
	 * Any error that occurred on the broadcast channel.
	 */
	error: Signal<Event | null>;
	/**
	 * Whether the broadcast channel is closed.
	 */
	isClosed: Signal<boolean>;
}

/**
 * Reactive BroadcastChannel API.
 *
 * The BroadcastChannel interface represents a named channel that any browsing
 * context of a given origin can subscribe to. It allows communication between
 * different documents (in different windows, tabs, frames, or iframes) of the
 * same origin.
 *
 * Messages are broadcasted via a message event fired at all BroadcastChannel
 * objects listening to the channel.
 *
 * Closes the broadcast channel automatically when the component is destroyed.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
 *
 * @example
 * ```ts
 * const {
 *   isSupported,
 *   data,
 *   post,
 *   close,
 *   error,
 *   isClosed,
 * } = injectBroadcastChannel({ name: 'my-channel' });
 *
 * // Post a message to the broadcast channel
 * post('Hello, World!');
 *
 * // Listen for data changes
 * effect(() => {
 *   console.log('Received:', data());
 * });
 *
 * // Optionally close the channel manually
 * close();
 * ```
 *
 * @param options Configuration options:
 *   - `name`: (Required) The name of the channel.
 *   - `window`: (Optional) Specifies a custom `Window` instance. This is useful when working with iframes or in testing environments.
 *   - `injector`: (Optional) Specifies a custom `Injector` instance for dependency injection.
 *
 * @returns An object with:
 *   - `isSupported`: Signal indicating if BroadcastChannel is supported
 *   - `channel`: Signal containing the BroadcastChannel instance
 *   - `data`: Signal containing the last received data
 *   - `post`: Function to post messages to the channel
 *   - `close`: Function to close the channel
 *   - `error`: Signal containing any errors that occurred
 *   - `isClosed`: Signal indicating if the channel is closed
 */
export function injectBroadcastChannel<D = unknown, P = unknown>(
	options: InjectBroadcastChannelOptions,
): Readonly<BroadcastChannelReturn<D, P>> {
	return assertInjector(injectBroadcastChannel, options.injector, () => {
		const { name, window: customWindow } = options;
		const window: Window = customWindow ?? inject(DOCUMENT).defaultView!;

		const isSupported = signal(window && 'BroadcastChannel' in window);
		const isClosed = signal(false);
		const channel = signal<BroadcastChannel | undefined>(undefined);
		const data = signal<D | undefined>(undefined);
		const error = signal<Event | null>(null);

		const post = (data: P) => {
			const ch = channel();
			if (ch && !isClosed()) {
				ch.postMessage(data);
			}
		};

		const close = () => {
			const ch = channel();
			if (ch && !isClosed()) {
				ch.close();
				isClosed.set(true);
			}
		};

		if (isSupported()) {
			try {
				error.set(null);
				const bc = new BroadcastChannel(name);
				channel.set(bc);

				fromEvent<MessageEvent>(bc, 'message')
					.pipe(takeUntilDestroyed())
					.subscribe((e) => {
						data.set(e.data);
					});

				fromEvent<MessageEvent>(bc, 'messageerror')
					.pipe(takeUntilDestroyed())
					.subscribe((e) => {
						error.set(e);
					});

				fromEvent(bc, 'close')
					.pipe(takeUntilDestroyed())
					.subscribe(() => {
						isClosed.set(true);
					});
			} catch (e) {
				error.set(e as Event);
			}
		}

		return {
			isSupported: isSupported.asReadonly(),
			channel: channel.asReadonly(),
			data: data.asReadonly(),
			post,
			close,
			error: error.asReadonly(),
			isClosed: isClosed.asReadonly(),
		};
	});
}
