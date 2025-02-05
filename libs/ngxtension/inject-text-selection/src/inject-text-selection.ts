import { DOCUMENT } from '@angular/common';
import {
	computed,
	DestroyRef,
	inject,
	Injectable,
	signal,
} from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';

/**
 * A simple interface for passing a custom Window.
 */
export interface ConfigurableWindow {
	window?: Window;
}

@Injectable({ providedIn: 'root' })
export class TextSelectionService {
	readonly window = inject(DOCUMENT).defaultView!;

	// A writable signal to store number of listeners
	readonly listeners = signal<number>(0);

	// A writable signal to store the current Selection (or null).
	readonly selection = signal<Selection | null>(null);

	// A computed signal that returns the current selected text.
	readonly text = computed(() =>
		this.selection() ? this.selection()!.toString() : '',
	);

	// A computed signal that returns the list of Range objects (if any).
	readonly ranges = computed(() =>
		this.selection() ? getRangesFromSelection(this.selection()!) : [],
	);

	// A computed signal that maps each Range to its bounding client rect.
	readonly rects = computed(() =>
		this.ranges().map((range) => range.getBoundingClientRect()),
	);

	isListening = false;

	constructor() {
		/**
		 * Handler for the 'selectionchange' event.
		 * We first clear the signal, then update it with the latest selection.
		 */
		const onSelectionChange = () => {
			this.selection.set(null);
			if (this.window) {
				this.selection.set(this.window.getSelection());
			}
		};

		explicitEffect([this.listeners], ([listeners]) => {
			if (listeners === 0 && this.isListening) {
				window.document.removeEventListener(
					'selectionchange',
					onSelectionChange,
				);
				this.isListening = false;
			}

			if (listeners > 0 && !this.isListening) {
				window.document.addEventListener('selectionchange', onSelectionChange, {
					passive: true,
				});
				this.isListening = true;
			}
		});
	}
}

/**
 * Returns an array of Range objects from a Selection.
 */
function getRangesFromSelection(selection: Selection): Range[] {
	const rangeCount = selection.rangeCount ?? 0;
	return Array.from({ length: rangeCount }, (_, i) => selection.getRangeAt(i));
}

/**
 * Creates reactive signals for text selection using Angular signals.
 *
 * @returns An object with signals for the selected text, selection ranges, rects, and the raw selection.
 */
export function injectTextSelection() {
	const textSelectionService = inject(TextSelectionService);
	const destroyRef = inject(DestroyRef);
	textSelectionService.listeners.set(textSelectionService.listeners() + 1);

	destroyRef.onDestroy(() => {
		textSelectionService.listeners.set(textSelectionService.listeners() - 1);
	});

	return {
		text: textSelectionService.text,
		rects: textSelectionService.rects,
		ranges: textSelectionService.ranges,
		selection: textSelectionService.selection,
	};
}
