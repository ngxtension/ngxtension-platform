---
title: signalHistory
description: Records the changes of a writable signal and gives you undo, redo, reset and clear.
entryPoint: ngxtension/signal-history
contributors: ['enea-jahollari']
---

`signalHistory` watches a writable signal and records each new value, so you can add undo and redo to forms, editors or drawing tools without keeping your own stacks. It returns the history as a signal plus `undo`, `redo`, `canUndo` and `canRedo` that you can bind straight to buttons.

## Usage

```angular-ts
import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { signalHistory } from 'ngxtension/signal-history';

@Component({
	selector: 'app-editor',
	imports: [JsonPipe],
	template: `
		<p>Value: {{ value() }}</p>

		<button (click)="value.set(value() + 1)">+1</button>
		<button (click)="history.undo()" [disabled]="!history.canUndo()">Undo</button>
		<button (click)="history.redo()" [disabled]="!history.canRedo()">Redo</button>
		<button (click)="history.reset()">Reset</button>
		<button (click)="history.clear()">Clear</button>

		<pre>{{ history.history() | json }}</pre>
	`,
})
export class Editor {
	readonly value = signal(0);
	readonly history = signalHistory(this.value);
}
```

The history starts with the signal's initial value. `undo()` and `redo()` write the old value back into the source signal, so everything that reads `value()` updates too.

## Limit the history size

By default the 100 most recent records are kept. Older records are dropped first.

```ts
readonly history = signalHistory(this.value, { capacity: 20 });
```

## Record only some changes

Pass `shouldRecord` to decide which changes become history records. It receives the new value and the last recorded value.

```ts
readonly tags = signal<string[]>([]);

readonly tagsHistory = signalHistory(this.tags, {
	// only record changes that add or remove a tag
	shouldRecord: (value, oldValue) => value.length !== oldValue.length,
});
```

A value that is the same (`===`) as the last record is never recorded.

## Use it outside an injection context

`signalHistory` uses an effect internally, so it needs an injection context. Outside one (for example in `ngOnInit`), pass an `injector`:

```ts
private readonly injector = inject(Injector);
readonly value = signal(0);

ngOnInit() {
	const history = signalHistory(this.value, { injector: this.injector });
}
```

## API

```ts
function signalHistory<T>(
	source: WritableSignal<T>,
	options?: {
		capacity?: number;
		shouldRecord?: (value: T, oldValue: T) => boolean;
		injector?: Injector;
	},
): {
	history: Signal<{ value: T; timestamp: number }[]>;
	undo: () => void;
	redo: () => void;
	reset: () => void;
	clear: () => void;
	canUndo: Signal<boolean>;
	canRedo: Signal<boolean>;
};
```

| Option         | Type                                 | Default         | Description                                           |
| -------------- | ------------------------------------ | --------------- | ----------------------------------------------------- |
| `capacity`     | `number`                             | `100`           | Maximum number of records to keep.                    |
| `shouldRecord` | `(value: T, oldValue: T) => boolean` | record all      | Return `false` to skip recording a change.            |
| `injector`     | `Injector`                           | current context | Needed when you call it outside an injection context. |

| Returned  | Description                                                                                  |
| --------- | -------------------------------------------------------------------------------------------- |
| `history` | Signal with the recorded values, oldest first. Each record has `value` and `timestamp` (ms). |
| `undo`    | Sets the source back to the previous record. Does nothing at the first record.               |
| `redo`    | Re-applies the last undone record. Making a new change clears the redo stack.                |
| `reset`   | Keeps only the current record, clearing undo and redo.                                       |
| `clear`   | Removes all records.                                                                         |
| `canUndo` | `true` when there is more than one record.                                                   |
| `canRedo` | `true` when there is something to redo.                                                      |

:::note[Changes are recorded by an effect]
New values are picked up when the internal effect runs, not at the moment you call `set()`. If you set the signal several times in the same synchronous block, only the last value is recorded.
:::

## Related

- [`computedPrevious`](/utilities/signal-primitives/computed-previous/) when you only need the last value.
