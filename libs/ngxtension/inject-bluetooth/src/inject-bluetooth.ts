import { DOCUMENT } from '@angular/common';
import { effect, inject, Injector, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEvent } from 'rxjs';

// Ported from https://vueuse.org/core/useBluetooth/

// Type definitions for Web Bluetooth API
// These types are minimal definitions for the Bluetooth API
// For full type definitions, install @types/web-bluetooth
declare global {
	interface Navigator {
		bluetooth?: Bluetooth;
	}

	interface Bluetooth {
		requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
	}

	interface RequestDeviceOptions {
		filters?: BluetoothLEScanFilter[];
		optionalServices?: BluetoothServiceUUID[];
		acceptAllDevices?: boolean;
	}

	interface BluetoothLEScanFilter {
		services?: BluetoothServiceUUID[];
		name?: string;
		namePrefix?: string;
	}

	type BluetoothServiceUUID = string | number;

	interface BluetoothDevice extends EventTarget {
		id: string;
		name?: string;
		gatt?: BluetoothRemoteGATTServer;
	}

	interface BluetoothRemoteGATTServer {
		device: BluetoothDevice;
		connected: boolean;
		connect(): Promise<BluetoothRemoteGATTServer>;
		disconnect(): void;
		getPrimaryService(
			service: BluetoothServiceUUID,
		): Promise<BluetoothRemoteGATTService>;
	}

	interface BluetoothRemoteGATTService {
		device: BluetoothDevice;
		uuid: string;
		isPrimary: boolean;
		getCharacteristic(
			characteristic: BluetoothServiceUUID,
		): Promise<BluetoothRemoteGATTCharacteristic>;
	}

	interface BluetoothRemoteGATTCharacteristic extends EventTarget {
		service: BluetoothRemoteGATTService;
		uuid: string;
		value?: DataView;
		readValue(): Promise<DataView>;
		writeValue(value: BufferSource): Promise<void>;
		startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
		stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
	}
}

export interface InjectBluetoothRequestDeviceOptions {
	/**
	 * An array of BluetoothScanFilters. This filter consists of an array
	 * of BluetoothServiceUUIDs, a name parameter, and a namePrefix parameter.
	 */
	filters?: BluetoothLEScanFilter[] | undefined;
	/**
	 * An array of BluetoothServiceUUIDs.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTService/uuid
	 */
	optionalServices?: BluetoothServiceUUID[] | undefined;
}

export interface InjectBluetoothOptions
	extends InjectBluetoothRequestDeviceOptions {
	/**
	 * A boolean value indicating that the requesting script can accept all Bluetooth
	 * devices. The default is false.
	 *
	 * !! This may result in a bunch of unrelated devices being shown
	 * in the chooser and energy being wasted as there are no filters.
	 *
	 * Use it with caution.
	 *
	 * @default false
	 */
	acceptAllDevices?: boolean;
	/**
	 * A custom Window instance. This is useful when working with iframes or in testing environments.
	 */
	window?: Window;
	/**
	 * A custom Injector instance for dependency injection.
	 */
	injector?: Injector;
}

export interface InjectBluetoothReturn {
	/**
	 * Whether the Web Bluetooth API is supported
	 */
	supported: Signal<boolean>;
	/**
	 * Whether a device is currently connected
	 */
	isConnected: Signal<boolean>;
	/**
	 * The connected Bluetooth device
	 */
	device: Signal<BluetoothDevice | undefined>;
	/**
	 * Function to request a Bluetooth device
	 */
	requestDevice: () => Promise<void>;
	/**
	 * The GATT server for the connected device
	 */
	server: Signal<BluetoothRemoteGATTServer | undefined>;
	/**
	 * Any error that occurred during connection
	 */
	error: Signal<unknown | null>;
}

/**
 * Reactive Web Bluetooth API. Provides the ability to connect and interact with Bluetooth Low Energy peripherals.
 *
 * The Web Bluetooth API lets websites discover and communicate with devices over the Bluetooth 4 wireless standard
 * using the Generic Attribute Profile (GATT).
 *
 * @example
 * ```ts
 * const bluetooth = injectBluetooth({
 *   acceptAllDevices: true,
 * });
 *
 * effect(() => {
 *   console.log('Supported:', bluetooth.supported());
 *   console.log('Connected:', bluetooth.isConnected());
 *   console.log('Device:', bluetooth.device());
 *   console.log('Server:', bluetooth.server());
 *   console.log('Error:', bluetooth.error());
 * });
 *
 * // Request a device
 * bluetooth.requestDevice();
 * ```
 *
 * @param options Configuration options
 * @returns An object with signals and methods to interact with Bluetooth devices
 */
export function injectBluetooth(
	options: InjectBluetoothOptions = {},
): InjectBluetoothReturn {
	return assertInjector(injectBluetooth, options.injector, () => {
		let {
			acceptAllDevices = false,
			filters = undefined,
			optionalServices = undefined,
			window: customWindow,
		} = options;

		const window: Window = customWindow ?? inject(DOCUMENT).defaultView!;
		const navigator = window?.navigator;

		const supported = signal(
			window?.navigator && 'bluetooth' in window.navigator,
		);

		const device = signal<BluetoothDevice | undefined>(undefined);
		const error = signal<unknown | null>(null);
		const server = signal<BluetoothRemoteGATTServer | undefined>(undefined);
		const isConnected = signal(false);

		function reset() {
			isConnected.set(false);
			device.set(undefined);
			server.set(undefined);
		}

		async function connectToBluetoothGATTServer() {
			// Reset any errors we currently have
			error.set(null);

			const currentDevice = device();
			if (currentDevice && currentDevice.gatt) {
				// Add reset fn to gattserverdisconnected event
				fromEvent(currentDevice, 'gattserverdisconnected')
					.pipe(takeUntilDestroyed())
					.subscribe(() => reset());

				try {
					// Connect to the device
					const gattServer = await currentDevice.gatt.connect();
					server.set(gattServer);
					isConnected.set(gattServer.connected);
				} catch (err) {
					error.set(err);
				}
			}
		}

		async function requestDevice(): Promise<void> {
			// This function can only be called if Bluetooth API is supported
			if (!supported()) return;

			// Reset any errors we currently have
			error.set(null);

			// If filters specified, we need to ensure we don't accept all devices
			if (filters && filters.length > 0) {
				acceptAllDevices = false;
			}

			try {
				const requestedDevice = await navigator?.bluetooth?.requestDevice({
					acceptAllDevices,
					filters,
					optionalServices,
				});
				device.set(requestedDevice);
			} catch (err) {
				error.set(err);
			}
		}

		// Watch for device changes and connect to GATT server
		effect(
			() => {
				const currentDevice = device();
				if (currentDevice) {
					connectToBluetoothGATTServer();
				}
			},
			{ allowSignalWrites: true },
		);

		// On component mount, try to connect if device exists
		effect(() => {
			const currentDevice = device();
			if (currentDevice) {
				currentDevice.gatt?.connect();
			}
		});

		// On component destroy, disconnect from device
		effect((onCleanup) => {
			onCleanup(() => {
				const currentDevice = device();
				if (currentDevice) {
					currentDevice.gatt?.disconnect();
				}
			});
		});

		return {
			supported: supported.asReadonly(),
			isConnected: isConnected.asReadonly(),
			device: device.asReadonly(),
			requestDevice,
			server: server.asReadonly(),
			error: error.asReadonly(),
		};
	});
}
