import { DOCUMENT } from '@angular/common';
import {
	computed,
	inject,
	type Injector,
	type Signal,
	signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

// Ported from https://vueuse.org/core/useEyeDropper/

export interface EyeDropperOpenOptions {
	/**
	 * AbortSignal to abort the eye dropper selection.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
	 */
	signal?: AbortSignal;
}

export interface EyeDropper {
	open: (options?: EyeDropperOpenOptions) => Promise<{ sRGBHex: string }>;
}

export interface InjectEyeDropperOptions {
	/**
	 * Initial sRGBHex value.
	 *
	 * @default ''
	 */
	initialValue?: string;

	/**
	 * Specify a custom `Injector` instance to use for dependency injection.
	 */
	injector?: Injector;
}

export interface InjectEyeDropperReturn {
	/**
	 * Whether the EyeDropper API is supported.
	 */
	isSupported: Signal<boolean>;

	/**
	 * The selected color in sRGBHex format.
	 */
	sRGBHex: Signal<string>;

	/**
	 * Opens the eye dropper to select a color.
	 * @param openOptions - Optional configuration for the eye dropper.
	 * @returns A promise that resolves with the selected color or undefined if not supported.
	 */
	open: (
		openOptions?: EyeDropperOpenOptions,
	) => Promise<{ sRGBHex: string } | undefined>;
}

/**
 * Reactive [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API) for Angular.
 *
 * The EyeDropper API provides a mechanism for creating an eyedropper tool. Using this API, users can sample colors from their screens, including outside the browser window.
 *
 * @example
 * ```ts
 * import { Component } from '@angular/core';
 * import { injectEyeDropper } from 'ngxtension/inject-eye-dropper';
 *
 * @Component({
 *   selector: 'app-color-picker',
 *   template: `
 *     <div>
 *       <button
 *         [disabled]="!eyeDropper.isSupported()"
 *         (click)="pickColor()"
 *       >
 *         Pick Color
 *       </button>
 *       @if (eyeDropper.sRGBHex()) {
 *         <div [style.color]="eyeDropper.sRGBHex()">
 *           Selected: {{ eyeDropper.sRGBHex() }}
 *         </div>
 *       }
 *     </div>
 *   `,
 * })
 * export class ColorPickerComponent {
 *   eyeDropper = injectEyeDropper();
 *
 *   async pickColor() {
 *     await this.eyeDropper.open();
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // With initial value
 * const eyeDropper = injectEyeDropper({ initialValue: '#ff0000' });
 * ```
 *
 * @example
 * ```ts
 * // With AbortSignal to cancel the operation
 * const eyeDropper = injectEyeDropper();
 * const controller = new AbortController();
 *
 * // Start color picking
 * eyeDropper.open({ signal: controller.signal });
 *
 * // Cancel after 5 seconds
 * setTimeout(() => controller.abort(), 5000);
 * ```
 *
 * @param options - Configuration options
 * @returns An object containing the eye dropper state and operations
 */
export function injectEyeDropper(
	options: InjectEyeDropperOptions = {},
): InjectEyeDropperReturn {
	return assertInjector(injectEyeDropper, options.injector, () => {
		const document = inject(DOCUMENT);
		const { initialValue = '' } = options;

		const window = document.defaultView;
		const isSupported = computed(
			() => window != null && 'EyeDropper' in window,
		);

		const sRGBHex = signal(initialValue);

		async function open(
			openOptions?: EyeDropperOpenOptions,
		): Promise<{ sRGBHex: string } | undefined> {
			if (!isSupported()) {
				return undefined;
			}

			const eyeDropper: EyeDropper = new (window as any).EyeDropper();
			const result = await eyeDropper.open(openOptions);
			sRGBHex.set(result.sRGBHex);
			return result;
		}

		return {
			isSupported: isSupported,
			sRGBHex: sRGBHex.asReadonly(),
			open,
		};
	});
}
