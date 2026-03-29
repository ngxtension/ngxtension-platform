import { DOCUMENT } from '@angular/common';
import { inject, type Injector, signal } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

// Ported from https://vueuse.org/core/useFileDialog/

export interface InjectFileDialogOptions {
	injector?: Injector;
	/**
	 * @default true
	 */
	multiple?: boolean;
	/**
	 * @default '*'
	 */
	accept?: string;
	/**
	 * Select the input source for the capture file.
	 * @see [HTMLInputElement Capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
	 */
	capture?: string;
	/**
	 * Reset when open file dialog.
	 * @default false
	 */
	reset?: boolean;
	/**
	 * Select directories instead of files.
	 * @see [HTMLInputElement webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
	 * @default false
	 */
	directory?: boolean;
	/**
	 * Initial files to set.
	 * @default null
	 */
	initialFiles?: Array<File> | FileList;
}

const DEFAULT_OPTIONS: Required<
	Omit<InjectFileDialogOptions, 'injector' | 'capture' | 'initialFiles'>
> = {
	multiple: true,
	accept: '*',
	reset: false,
	directory: false,
};

export interface InjectFileDialogReturn {
	files: ReturnType<typeof signal<FileList | null>>;
	open: (localOptions?: Partial<InjectFileDialogOptions>) => void;
	reset: () => void;
	onChange: (callback: (files: FileList | null) => void) => void;
	onCancel: (callback: () => void) => void;
}

function prepareInitialFiles(
	files: InjectFileDialogOptions['initialFiles'],
): FileList | null {
	if (!files) return null;

	if (files instanceof FileList) return files;

	const dt = new DataTransfer();
	for (const file of files) {
		dt.items.add(file);
	}

	return dt.files;
}

/**
 * Open file dialog with ease.
 *
 * @example
 * ```ts
 * const fileDialog = injectFileDialog({
 *   accept: 'image/*',
 *   directory: false,
 *   multiple: true,
 * });
 *
 * fileDialog.onChange((files) => {
 *   console.log(files);
 * });
 *
 * fileDialog.onCancel(() => {
 *   console.log('Dialog cancelled');
 * });
 *
 * // Open the dialog
 * fileDialog.open();
 *
 * // Access files
 * effect(() => {
 *   console.log(fileDialog.files());
 * });
 * ```
 *
 * @param options An optional object with the following properties:
 *   - `multiple`: (Optional) Allow multiple file selection. Default is `true`.
 *   - `accept`: (Optional) File types to accept (e.g., 'image/*', '.pdf'). Default is '*'.
 *   - `capture`: (Optional) Capture source for mobile devices (e.g., 'user', 'environment').
 *   - `reset`: (Optional) Reset files when opening dialog. Default is `false`.
 *   - `directory`: (Optional) Select directories instead of files. Default is `false`.
 *   - `initialFiles`: (Optional) Initial files to set.
 *   - `injector`: (Optional) Specifies a custom `Injector` instance for dependency injection.
 *
 * @returns An object with the following properties:
 *   - `files`: A readonly signal containing the selected files (FileList | null).
 *   - `open`: A function to programmatically open the file dialog.
 *   - `reset`: A function to clear the selected files.
 *   - `onChange`: A function to register a callback when files are selected.
 *   - `onCancel`: A function to register a callback when the dialog is cancelled.
 */
export function injectFileDialog(
	options: InjectFileDialogOptions = {},
): InjectFileDialogReturn {
	return assertInjector(injectFileDialog, options.injector, () => {
		const document = inject(DOCUMENT);

		const files = signal<FileList | null>(
			prepareInitialFiles(options.initialFiles),
		);

		const changeCallbacks = new Set<(files: FileList | null) => void>();
		const cancelCallbacks = new Set<() => void>();

		let inputElement: HTMLInputElement | null = null;

		const getInputElement = (): HTMLInputElement => {
			if (!inputElement) {
				inputElement = document.createElement('input');
				inputElement.type = 'file';

				inputElement.onchange = (event: Event) => {
					const result = event.target as HTMLInputElement;
					const newFiles = result.files;
					files.set(newFiles);
					changeCallbacks.forEach((callback) => callback(newFiles));
				};

				inputElement.oncancel = () => {
					cancelCallbacks.forEach((callback) => callback());
				};
			}
			return inputElement;
		};

		const reset = () => {
			files.set(null);
			const input = getInputElement();
			if (input.value) {
				input.value = '';
				changeCallbacks.forEach((callback) => callback(null));
			}
		};

		const applyOptions = (opts: InjectFileDialogOptions) => {
			const el = getInputElement();
			if (opts.multiple !== undefined) el.multiple = opts.multiple;
			if (opts.accept !== undefined) el.accept = opts.accept;
			if (opts.directory !== undefined) {
				(el as any).webkitdirectory = opts.directory;
			}
			if (opts.capture !== undefined) el.capture = opts.capture;
		};

		const open = (localOptions?: Partial<InjectFileDialogOptions>) => {
			const mergedOptions = {
				...DEFAULT_OPTIONS,
				...options,
				...localOptions,
			};

			applyOptions(mergedOptions);

			if (mergedOptions.reset) {
				reset();
			}

			getInputElement().click();
		};

		const onChange = (callback: (files: FileList | null) => void) => {
			changeCallbacks.add(callback);
		};

		const onCancel = (callback: () => void) => {
			cancelCallbacks.add(callback);
		};

		// Apply initial options
		applyOptions(options);

		return {
			files: files.asReadonly(),
			open,
			reset,
			onChange,
			onCancel,
		};
	});
}
