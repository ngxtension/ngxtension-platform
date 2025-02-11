import { DOCUMENT } from '@angular/common';
import {
	computed,
	DestroyRef,
	inject,
	Injectable,
	signal,
} from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Injectable({ providedIn: 'root' })
export class TextSelectionService {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	readonly window = inject(DOCUMENT).defaultView!;

	// A writable signal to store number of listeners
	readonly listeners = signal<number>(0);

	// A writable signal to store the current Selection (or null).
	readonly selection = signal<Selection | null>(null);

	// A computed signal that returns the current selected text.
	readonly text = computed(() =>
		this.selection() ? this.selection()?.toString() : '',
	);

	// A computed signal that returns the list of Range objects (if any).
	readonly ranges = computed(() =>
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.selection() ? getRangesFromSelection(this.selection()!) : [],
	);

	// A computed signal that maps each Range to its bounding client rect.
	readonly rects = computed(() =>
		this.ranges().map((range) => range.getBoundingClientRect()),
	);

	private isListening = false;

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
				// if we don't have any listeners anymore, we need to remove the event listener
				this.window.document.removeEventListener(
					'selectionchange',
					onSelectionChange,
				);
				this.isListening = false;
			}

			if (listeners > 0 && !this.isListening) {
				this.window.document.addEventListener(
					'selectionchange',
					onSelectionChange,
					{
						passive: true,
					},
				);
				this.isListening = true;
			}
		});
	}

	/**
	 * Clears the selection. This is a convenience method for `window.getSelection().empty()`.
	 */
	resetSelection() {
		this.window.getSelection()?.empty();
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
 * Creates reactive signals for text selection.
 *
 * Example:
 * ```ts
 * const selection = injectTextSelection();
 *
 * selection.text() // returns the selected text
 * selection.rects() // returns an array of bounding rects for each selection range
 * selection.ranges() // returns an array of Range objects for each selection range
 * selection.selection() // returns the Selection object
 * selection.clearSelection() // clears the selection
 * ```
 *
 * @returns An object with signals for the selected text, selection ranges, rects, and the raw selection.
 */
export function injectTextSelection() {
	const textSelectionService = inject(TextSelectionService);
	const destroyRef = inject(DestroyRef);

	// we want to increase the listeners count when the component is created and decrease it when it is destroyed
	// this is to ensure that we only add the event listener when there are listeners
	textSelectionService.listeners.update((x) => x + 1);
	destroyRef.onDestroy(() =>
		textSelectionService.listeners.update((x) => x - 1),
	);

	return {
		text: textSelectionService.text,
		rects: textSelectionService.rects,
		ranges: textSelectionService.ranges,
		selection: textSelectionService.selection.asReadonly(),
		clearSelection: () => textSelectionService.resetSelection(),
	};
}
