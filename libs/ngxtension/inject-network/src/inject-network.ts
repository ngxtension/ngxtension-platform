import { DOCUMENT } from '@angular/common';
import { inject, signal, type Injector, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEvent, map, merge, startWith } from 'rxjs';

// Ported from https://vueuse.org/core/useNetwork/

export type NetworkType =
	| 'bluetooth'
	| 'cellular'
	| 'ethernet'
	| 'none'
	| 'wifi'
	| 'wimax'
	| 'other'
	| 'unknown';

export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | '5g';

export interface NetworkState {
	supported: Signal<boolean>;
	online: Signal<boolean>;
	/**
	 * The time since the user was last connected.
	 */
	offlineAt: Signal<number | undefined>;
	/**
	 * At this time, if the user is offline and reconnects
	 */
	onlineAt: Signal<number | undefined>;
	/**
	 * The download speed in Mbps.
	 */
	downlink: Signal<number | undefined>;
	/**
	 * The max reachable download speed in Mbps.
	 */
	downlinkMax: Signal<number | undefined>;
	/**
	 * The detected effective speed type.
	 */
	effectiveType: Signal<NetworkEffectiveType | undefined>;
	/**
	 * The estimated effective round-trip time of the current connection.
	 */
	rtt: Signal<number | undefined>;
	/**
	 * If the user activated data saver mode.
	 */
	saveData: Signal<boolean | undefined>;
	/**
	 * The detected connection/network type.
	 */
	type: Signal<NetworkType>;
}

export interface InjectNetworkOptions {
	injector?: Injector;
	window?: Window;
}

/**
 * This injector is useful for tracking the current network state of the user. It provides information about the system's connection type, such as 'wifi' or 'cellular'. This utility, along with a singular property added to the Navigator interface (Navigator.connection), allows for the identification of the general type of network connection a system is using. This functionality is particularly useful for choosing between high definition or low definition content depending on the user's network connection.
 *
 * @example
 * ```ts
 * const network = injectNetwork();
 * effect(() => {
 *  console.log(this.network.type());
 *  console.log(this.network.downlink());
 *  console.log(this.network.downlinkMax());
 *  console.log(this.network.effectiveType());
 *  console.log(this.network.rtt());
 *  console.log(this.network.saveData());
 *  console.log(this.network.online());
 *  console.log(this.network.offlineAt());
 *  console.log(this.network.onlineAt());
 *  console.log(this.network.supported());
 *  });
 *  ```
 *
 * @param options An optional object with the following properties:
 *   - `window`: (Optional) Specifies a custom `Window` instance. This is useful when working with iframes or in testing environments where the global `window` might not be appropriate.
 *   - `injector`: (Optional) Specifies a custom `Injector` instance for dependency injection. This allows for more flexible and testable code by decoupling from a global state or context.
 *
 * @returns A readonly object with the following properties:
 *  - `supported`: A signal that emits `true` if the browser supports the Network Information API, otherwise `false`.
 *  - `online`: A signal that emits `true` if the user is online, otherwise `false`.
 *  - `offlineAt`: A signal that emits the time since the user was last connected.
 *  - `onlineAt`: A signal that emits the time since the user was last disconnected.
 *  - `downlink`: A signal that emits the download speed in Mbps.
 *  - `downlinkMax`: A signal that emits the max reachable download speed in Mbps.
 *  - `effectiveType`: A signal that emits the detected effective speed type.
 *  - `rtt`: A signal that emits the estimated effective round-trip time of the current connection.
 *  - `saveData`: A signal that emits `true` if the user activated data saver mode, otherwise `false`.
 *  - `type`: A signal that emits the detected connection/network type.
 */
export function injectNetwork({
	injector,
	window: customWindow,
}: InjectNetworkOptions = {}): Readonly<NetworkState> {
	return assertInjector(injectNetwork, injector, () => {
		const window: Window = customWindow ?? inject(DOCUMENT).defaultView!;
		const navigator = window?.navigator;

		const supported = signal(
			window?.navigator && 'connection' in window.navigator
		);

		const online = signal(true);
		const saveData = signal(false);
		const offlineAt = signal<number | undefined>(undefined);
		const onlineAt = signal<number | undefined>(undefined);
		const downlink = signal<number | undefined>(undefined);
		const downlinkMax = signal<number | undefined>(undefined);
		const rtt = signal<number | undefined>(undefined);
		const effectiveType = signal<NetworkEffectiveType | undefined>(undefined);
		const type = signal<NetworkType>('unknown');

		const connection = supported() && (navigator as any).connection;

		const updateNetworkInformation = () => {
			if (!navigator) return;

			offlineAt.set(online() ? undefined : Date.now());
			onlineAt.set(online() ? Date.now() : undefined);

			if (connection) {
				downlink.set(connection.downlink);
				downlinkMax.set(connection.downlinkMax);
				effectiveType.set(connection.effectiveType);
				rtt.set(connection.rtt);
				saveData.set(connection.saveData);
				type.set(connection.type);
			}
		};

		if (window) {
			merge(
				fromEvent(window, 'online').pipe(map(() => true)),
				fromEvent(window, 'offline').pipe(map(() => false))
			)
				.pipe(takeUntilDestroyed())
				.subscribe((isOnline) => {
					online.set(isOnline);
					if (isOnline) {
						onlineAt.set(Date.now());
					} else {
						offlineAt.set(Date.now());
					}
				});
		}

		if (connection) {
			fromEvent(connection, 'change')
				.pipe(
					startWith(null), // we need to start with null to trigger the first update
					takeUntilDestroyed()
				)
				.subscribe(() => updateNetworkInformation());
		}

		return {
			supported: supported.asReadonly(),
			online: online.asReadonly(),
			saveData: saveData.asReadonly(),
			offlineAt: offlineAt.asReadonly(),
			onlineAt: onlineAt.asReadonly(),
			downlink: downlink.asReadonly(),
			downlinkMax: downlinkMax.asReadonly(),
			effectiveType: effectiveType.asReadonly(),
			rtt: rtt.asReadonly(),
			type: type.asReadonly(),
		};
	});
}
