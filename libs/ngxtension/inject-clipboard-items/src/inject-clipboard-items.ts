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

export interface InjectClipboardItemsOptions<
	Source extends ClipboardItems | undefined,
> {
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
	 * Specify a custom `Injector` instance to use for dependency injection.
	 */
	injector?: Injector;
}

export interface InjectClipboardItemsReturn<Optional> {
	/**
	 * Whether the Clipboard API with ClipboardItem support is available.
	 */
	isSupported: Signal<boolean>;

	/**
	 * Current clipboard content as ClipboardItems.
	 */
	content: Signal<ClipboardItems>;

	/**
	 * Whether the last copy operation was successful.
	 * Automatically resets to false after `copiedDuring` milliseconds.
	 */
	copied: Signal<boolean>;

	/**
	 * Copy ClipboardItems to clipboard.
	 * @param items - ClipboardItems to copy. If not provided, uses the source option.
	 */
	copy: Optional extends true
		? (items?: ClipboardItems) => Promise<void>
		: (items: ClipboardItems) => Promise<void>;

	/**
	 * Manually read the current clipboard content.
	 */
	read: () => void;
}

/**
 * Reactive Clipboard API with ClipboardItem support for Angular.
 *
 * Provides the ability to copy rich content (images, HTML, etc.) to the clipboard
 * and optionally read from it using the Clipboard API with ClipboardItem support.
 *
 * @example
 * ```ts
 * // Copy text as ClipboardItem
 * const clipboard = injectClipboardItems();
 *
 * const textBlob = new Blob(['Hello World'], { type: 'text/plain' });
 * const item = new ClipboardItem({ 'text/plain': textBlob });
 * await clipboard.copy([item]);
 *
 * effect(() => {
 *   if (clipboard.copied()) {
 *     console.log('Content copied successfully!');
 *   }
 * });
 * ```
 *
 * @example
 * ```ts
 * // Copy image
 * const response = await fetch('/path/to/image.png');
 * const blob = await response.blob();
 * const item = new ClipboardItem({ 'image/png': blob });
 * await clipboard.copy([item]);
 * ```
 *
 * @example
 * ```ts
 * // Copy HTML content
 * const htmlBlob = new Blob(['<b>Bold text</b>'], { type: 'text/html' });
 * const textBlob = new Blob(['Bold text'], { type: 'text/plain' });
 * const item = new ClipboardItem({
 *   'text/html': htmlBlob,
 *   'text/plain': textBlob
 * });
 * await clipboard.copy([item]);
 * ```
 *
 * @example
 * ```ts
 * // With read option to monitor clipboard changes
 * const clipboard = injectClipboardItems({ read: true });
 *
 * effect(() => {
 *   const items = clipboard.content();
 *   console.log('Clipboard updated:', items);
 * });
 * ```
 *
 * @example
 * ```ts
 * // With source option
 * const source = signal([
 *   new ClipboardItem({
 *     'text/plain': new Blob(['Default text'], { type: 'text/plain' })
 *   })
 * ]);
 * const clipboard = injectClipboardItems({ source: source() });
 *
 * // Copy source value
 * await clipboard.copy();
 * ```
 *
 * @param options - Configuration options
 * @returns An object containing clipboard state and operations
 */
export function injectClipboardItems(
	options?: InjectClipboardItemsOptions<undefined>,
): InjectClipboardItemsReturn<false>;
export function injectClipboardItems(
	options: InjectClipboardItemsOptions<ClipboardItems>,
): InjectClipboardItemsReturn<true>;
export function injectClipboardItems(
	options: InjectClipboardItemsOptions<ClipboardItems | undefined> = {},
): InjectClipboardItemsReturn<boolean> {
	return assertInjector(injectClipboardItems, options.injector, () => {
		const document = inject(DOCUMENT);
		const destroyRef = inject(DestroyRef);

		const { read = false, source, copiedDuring = 1500 } = options;

		const navigator = document.defaultView?.navigator;

		// Check if Clipboard API with ClipboardItem is supported
		const isSupported = computed(
			() => navigator != null && 'clipboard' in navigator,
		);

		// Internal state
		const content = signal<ClipboardItems>([]);
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

		// Read ClipboardItems from clipboard
		async function updateContent(): Promise<void> {
			if (!isSupported()) {
				return;
			}

			const permissionRead = await getPermissionStatus(
				'clipboard-read' as PermissionName,
			);

			if (isAllowed(permissionRead)) {
				try {
					const items = await navigator!.clipboard.read();
					content.set(items);
				} catch {
					// Ignore read errors (e.g., permission denied)
				}
			}
		}

		// Set up event listeners for clipboard read
		if (isSupported() && read) {
			const handleClipboardChange = () => {
				void updateContent();
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

		// Copy ClipboardItems to clipboard
		async function copy(
			value: ClipboardItems = source as ClipboardItems,
		): Promise<void> {
			if (value == null) {
				return;
			}

			if (!isSupported()) {
				return;
			}

			const permissionWrite = await getPermissionStatus(
				'clipboard-write' as PermissionName,
			);

			if (isAllowed(permissionWrite)) {
				try {
					await navigator!.clipboard.write(value);
					content.set(value);
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
				} catch {
					// Ignore write errors (e.g., permission denied)
				}
			}
		}

		return {
			isSupported,
			content: content.asReadonly(),
			copied: copied.asReadonly(),
			copy,
			read: updateContent,
		};
	});
}
