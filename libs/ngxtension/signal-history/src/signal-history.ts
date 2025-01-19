import {
	computed,
	Injector,
	runInInjectionContext,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { explicitEffect } from 'ngxtension/explicit-effect';

interface SignalHistoryRecord<T> {
	value: T;
	timestamp: number;
}

/**
 * Creates a history record with the current timestamp.
 * @param value The value to store in the history record.
 * @returns A SignalHistoryRecord object.
 */
function createHistoryRecord<T>(value: T): SignalHistoryRecord<T> {
	return { value, timestamp: Date.now() };
}

/**
 * Enhances a writable signal with undo/redo history functionality.
 *
 * @param source The writable signal to track.
 * @param options Configuration options for the history.
 * @returns An object with `history`, `undo`, `redo`, `canUndo`, and `canRedo` properties.
 */
export function signalHistory<T>(
	source: WritableSignal<T>,
	options?: {
		/**
		 * The maximum number of history records to store.
		 * @default 100
		 */
		capacity?: number;

		/**
		 * The injector to use for the effect.
		 * @default undefined
		 */
		injector?: Injector;
	},
): {
	/**
	 * The history of changes to the source signal.
	 */
	history: Signal<SignalHistoryRecord<T>[]>;
	/**
	 * Undo the last change to the source signal.
	 */
	undo: () => void;
	/**
	 * Redo the last undone change to the source signal.
	 */
	redo: () => void;
	/**
	 * Reset the history to the current state.
	 */
	reset: () => void;
	/**
	 * Clear the history. This will remove all history records.
	 */
	clear: () => void;
	/**
	 * A signal indicating if undo is possible.
	 */
	canUndo: Signal<boolean>;
	/**
	 * A signal indicating if redo is possible.
	 */
	canRedo: Signal<boolean>;
} {
	const injector = assertInjector(signalHistory, options?.injector);
	return runInInjectionContext(injector, () => {
		const capacity = options?.capacity ?? 100; // Default capacity is 100 records

		// Initialize the undo and redo stacks as signals
		const undoStack = signal<SignalHistoryRecord<T>[]>([]);
		const redoStack = signal<SignalHistoryRecord<T>[]>([]);

		// Initialize with the current value of the source signal.
		// This ensures that the history always starts with the initial value.
		const initialRecord = createHistoryRecord(source());
		undoStack.set([initialRecord]);

		// Computed signal to provide the history of changes
		const history = computed(() => [...undoStack()]);

		// Computed signals to indicate if undo/redo actions are available
		const canUndo = computed(() => undoStack().length > 1); // Can undo if there's more than just the initial state
		const canRedo = computed(() => redoStack().length > 0); // Can redo if there's more than just the initial state

		// Use explicitEffect to track changes to the source signal
		explicitEffect(
			[source],
			([value]) => {
				// skip if the value is the same as the last value
				if (value === undoStack()[undoStack().length - 1]?.value) return;

				const newRecord = createHistoryRecord(value);

				// Update the undo stack with the new record
				undoStack.update((stack) => {
					const newStack = [...stack, newRecord];
					return capacity ? newStack.slice(-capacity) : newStack; // Apply capacity limit if provided
				});

				// Clear the redo stack when a new change is made,
				// because a new change invalidates the redo stack.
				redoStack.set([]);
			},
			{ defer: true, injector: options?.injector },
		);

		/**
		 * Undo the last change to the source signal.
		 */
		const undo = () => {
			if (undoStack().length > 1) {
				// Prevent undoing the initial state
				// Get the last record from the undo stack
				const currentRecord = undoStack()[undoStack().length - 1];

				// Remove the last record from the undo stack
				undoStack.update((stack) => stack.slice(0, -1));

				// Add the current record to the redo stack
				redoStack.update((stack) => [currentRecord, ...stack]);

				const previousRecord = undoStack()[undoStack().length - 1];

				// Set the source signal to the previous value
				source.set(previousRecord.value);
			}
		};

		/**
		 * Redo the last undone change to the source signal.
		 */
		const redo = () => {
			if (redoStack().length) {
				// Get the first record from the redo stack as we want to remove it
				const nextRecord = redoStack()[0];

				// Remove the first record from the redo stack
				redoStack.update((stack) => stack.slice(1));

				// Add the next record to the undo stack
				undoStack.update((stack) => [...stack, nextRecord]);

				// Set the source signal to the next value
				source.set(nextRecord.value);
			}
		};

		/**
		 * Reset the history to the current state.
		 */
		const reset = () => {
			const currentRecord = undoStack()[undoStack().length - 1];
			undoStack.set([currentRecord]);
			redoStack.set([]);
		};

		/**
		 * Clear the history. This will remove all history records.
		 */
		const clear = () => {
			undoStack.set([]);
			redoStack.set([]);
		};

		// Return the history, undo/redo/reset/clear functions, and canUndo/canRedo signals
		return {
			history,
			undo,
			redo,
			reset,
			clear,
			canUndo,
			canRedo,
		};
	});
}
