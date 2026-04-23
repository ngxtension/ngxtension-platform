import { DOCUMENT } from '@angular/common';
import {
	DestroyRef,
	type Injector,
	type Signal,
	computed,
	inject,
	signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

export interface InjectClipboardOptions<Source extends string | undefined> {
	/**
	 * Enabled reading for clipboard
	 *
	 * @default false
	 */
	read?: boolean;

	/**
	 * Copy source
	 */
	source?: Source;

	/**
	 * Milliseconds to reset state of `copied` signal
	 *
	 * @default 1500
	 */
	copiedDuring?: number;

	/**
	 * Whether fallback to document.execCommand('copy') if clipboard is undefined.
	 *
	 * @default false
	 */
	legacy?: boolean;

	/**
	 * Specify a custom `Injector` instance to use for dependency injection.
	 */
	injector?: Injector;
}

export interface InjectClipboardReturn<Optional> {
	/**
	 * Whether the Clipboard API is supported (native or legacy).
	 */
	isSupported: Signal<boolean>;

	/**
	 * Current clipboard text content.
	 */
	text: Signal<string>;

	/**
	 * Whether the last copy operation was successful.
	 * Automatically resets to false after `copiedDuring` milliseconds.
	 */
	copied: Signal<boolean>;

	/**
	 * Copy text to clipboard.
	 * @param text - Text to copy. If not provided, uses the source option.
	 */
	copy: Optional extends true
		? (text?: string) => Promise<void>
		: (text: string) => Promise<void>;
}

/**
 * Reactive Clipboard API for Angular.
 *
 * Provides the ability to copy text to the clipboard and optionally read from it,
 * with automatic fallback to legacy methods when the Clipboard API is not available.
 *
 * @example
 * ```ts
 * const clipboard = injectClipboard();
 * const source = signal('Hello World');
 *
 * // Copy text
 * await clipboard.copy('Text to copy');
 *
 * // Check if copied
 * effect(() => {
 *   if (clipboard.copied()) {
 *     console.log('Text copied successfully!');
 *   }
 * });
 * ```
 *
 * @example
 * ```ts
 * // With source option
 * const source = signal('Hello World');
 * const clipboard = injectClipboard({ source });
 *
 * // Copy source value
 * await clipboard.copy();
 * ```
 *
 * @example
 * ```ts
 * // With read option
 * const clipboard = injectClipboard({ read: true });
 *
 * effect(() => {
 *   console.log('Current clipboard text:', clipboard.text());
 * });
 * ```
 *
 * @param options - Configuration options
 * @returns An object containing clipboard state and operations
 */
export function injectClipboard(
	options?: InjectClipboardOptions<undefined>,
): InjectClipboardReturn<false>;
export function injectClipboard(
	options: InjectClipboardOptions<string>,
): InjectClipboardReturn<true>;
export function injectClipboard(
	options: InjectClipboardOptions<string | undefined> = {},
): InjectClipboardReturn<boolean> {
	return assertInjector(injectClipboard, options.injector, () => {
		const document = inject(DOCUMENT);
		const destroyRef = inject(DestroyRef);

		const {
			read = false,
			source,
			copiedDuring = 1500,
			legacy = false,
		} = options;

		const navigator = document.defaultView?.navigator;

		// Check if Clipboard API is supported
		const isClipboardApiSupported = computed(
			() => navigator != null && 'clipboard' in navigator,
		);

		// Check if clipboard is supported (native or legacy)
		const isSupported = computed(() => isClipboardApiSupported() || legacy);

		// Internal state
		const text = signal('');
		const copied = signal(false);
		let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

		// Clean up timeout on destroy
		destroyRef.onDestroy(() => {
			if (copiedTimeout !== undefined) {
				clearTimeout(copiedTimeout);
			}
		});

		// Helper to check permission status
		function isAllowed(status: PermissionState | undefined): boolean {
			return status === 'granted' || status === 'prompt';
		}

		// Helper to get permission status
		async function getPermissionStatus(
			name: PermissionName,
		): Promise<PermissionState | undefined> {
			if (!navigator?.permissions) {
				return undefined;
			}
			try {
				const result = await navigator.permissions.query({
					name: name as PermissionName,
				});
				return result.state;
			} catch {
				return undefined;
			}
		}

		// Read text from clipboard
		async function updateText(): Promise<void> {
			const permissionRead = await getPermissionStatus(
				'clipboard-read' as PermissionName,
			);
			let useLegacy = !(isClipboardApiSupported() && isAllowed(permissionRead));

			if (!useLegacy) {
				try {
					const clipboardText = await navigator!.clipboard.readText();
					text.set(clipboardText);
					return;
				} catch {
					useLegacy = true;
				}
			}

			if (useLegacy) {
				text.set(legacyRead());
			}
		}

		// Set up event listeners for clipboard read
		if (isSupported() && read) {
			const handleClipboardChange = () => {
				void updateText();
			};

			document.addEventListener('copy', handleClipboardChange, {
				passive: true,
			});
			document.addEventListener('cut', handleClipboardChange, {
				passive: true,
			});

			destroyRef.onDestroy(() => {
				document.removeEventListener('copy', handleClipboardChange);
				document.removeEventListener('cut', handleClipboardChange);
			});
		}

		// Copy text to clipboard
		async function copy(value: string = source as string): Promise<void> {
			if (value == null) {
				return;
			}

			// Try with Clipboard API first
			const permissionWrite = await getPermissionStatus(
				'clipboard-write' as PermissionName,
			);
			let useLegacy = !(
				isClipboardApiSupported() && isAllowed(permissionWrite)
			);

			if (!useLegacy) {
				try {
					await navigator!.clipboard.writeText(value);
				} catch {
					useLegacy = true;
				}
			}

			// Fall back to legacy method if needed and available
			if (useLegacy && (legacy || !isClipboardApiSupported())) {
				legacyCopy(value);
			}

			text.set(value);
			copied.set(true);

			// Clear previous timeout if exists
			if (copiedTimeout !== undefined) {
				clearTimeout(copiedTimeout);
			}

			// Reset copied status after copiedDuring milliseconds
			copiedTimeout = setTimeout(() => {
				copied.set(false);
				copiedTimeout = undefined;
			}, copiedDuring);
		}

		// Legacy copy using execCommand
		function legacyCopy(value: string): void {
			const ta = document.createElement('textarea');
			ta.value = value;
			ta.style.position = 'absolute';
			ta.style.opacity = '0';
			ta.setAttribute('readonly', '');
			document.body.appendChild(ta);
			ta.select();
			try {
				document.execCommand('copy');
			} catch {
				// Ignore errors in test environments where execCommand is not available
			}
			ta.remove();
		}

		// Legacy read from selection
		function legacyRead(): string {
			return document?.getSelection?.()?.toString() ?? '';
		}

		return {
			isSupported,
			text: text.asReadonly(),
			copied: copied.asReadonly(),
			copy,
		};
	});
}
