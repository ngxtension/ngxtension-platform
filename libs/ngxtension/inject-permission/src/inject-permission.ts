import { DOCUMENT } from '@angular/common';
import { inject, type Injector, type Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEventPattern } from 'rxjs';

// Ported from https://vueuse.org/core/usePermission/

type DescriptorNamePolyfill =
	| 'accelerometer'
	| 'accessibility-events'
	| 'ambient-light-sensor'
	| 'background-sync'
	| 'camera'
	| 'clipboard-read'
	| 'clipboard-write'
	| 'gyroscope'
	| 'magnetometer'
	| 'microphone'
	| 'notifications'
	| 'payment-handler'
	| 'persistent-storage'
	| 'push'
	| 'speaker'
	| 'local-fonts';

export type GeneralPermissionDescriptor =
	| PermissionDescriptor
	| { name: DescriptorNamePolyfill };

export interface InjectPermissionOptions {
	/**
	 * Specify a custom `Injector` instance for dependency injection.
	 */
	injector?: Injector;
}

/**
 * Reactive Permissions API for Angular.
 *
 * Provides a reactive way to query and monitor the status of permissions
 * using the browser's Permissions API.
 *
 * @example
 * ```ts
 * const microphonePermission = injectPermission('microphone');
 *
 * effect(() => {
 *   console.log('Microphone permission:', microphonePermission());
 *   // Outputs: 'granted', 'denied', or 'prompt'
 * });
 * ```
 *
 * @example
 * ```ts
 * // With permission descriptor object
 * const geolocationPermission = injectPermission({ name: 'geolocation' });
 *
 * effect(() => {
 *   if (geolocationPermission() === 'granted') {
 *     // Access geolocation
 *   }
 * });
 * ```
 *
 * @param permissionDesc - Permission name or descriptor object
 * @param options - Configuration options
 * @returns A readonly Signal<PermissionState | undefined> that emits the current permission state
 */
export function injectPermission(
	permissionDesc:
		| GeneralPermissionDescriptor
		| GeneralPermissionDescriptor['name'],
	options: InjectPermissionOptions = {},
): Signal<PermissionState | undefined> {
	return assertInjector(injectPermission, options.injector, () => {
		const document = inject(DOCUMENT);
		const navigator = document.defaultView?.navigator;

		const permissionState = signal<PermissionState | undefined>(undefined);
		let permissionStatus: PermissionStatus | undefined;

		// Check if Permissions API is supported
		const isSupported = navigator && 'permissions' in navigator;

		if (!isSupported) {
			return permissionState.asReadonly();
		}

		// Normalize permission descriptor
		const desc: PermissionDescriptor =
			typeof permissionDesc === 'string'
				? ({ name: permissionDesc } as PermissionDescriptor)
				: (permissionDesc as PermissionDescriptor);

		// Update permission state
		const update = () => {
			if (permissionStatus) {
				permissionState.set(permissionStatus.state);
			}
		};

		// Query permission status
		const queryPermission = async () => {
			if (!navigator?.permissions) {
				return;
			}

			try {
				permissionStatus = await navigator.permissions.query(desc);
				update();

				// Listen for permission changes
				fromEventPattern<Event>(
					(handler) => {
						permissionStatus?.addEventListener('change', handler);
					},
					(handler) => {
						permissionStatus?.removeEventListener('change', handler);
					},
				)
					.pipe(takeUntilDestroyed())
					.subscribe(() => {
						update();
					});
			} catch (error) {
				// Some permissions may not be supported or queryable
				permissionState.set(undefined);
			}
		};

		// Start querying the permission
		void queryPermission();

		return permissionState.asReadonly();
	});
}
