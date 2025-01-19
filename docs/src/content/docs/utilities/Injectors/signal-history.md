---
title: signalHistory
description: ngxtension/signal-history
entryPoint: ngxtension/signal-history
contributors: ['enea-jahollari']
---

`signalHistory` is a helper function that allows you to track the history of a signal and provides undo/redo functionality.

```ts
import { signalHistory } from 'ngxtension/signal-history';
```

## Usage

`signalHistory` needs a signal as an argument and returns an object with the following properties:

- `history`: A signal that represents the history of the source signal.
- `undo`: A function that undoes the last change to the source signal.
- `redo`: A function that redoes the last undone change to the source signal.
- `reset`: A function that resets the history to the current state.
- `clear`: A function that clears the history.
- `canUndo`: A signal that indicates if undo is possible.
- `canRedo`: A signal that indicates if redo is possible.

```ts
@Component({
	template: `
		<h2>Source: {{ source() | json }}</h2>

		<div>
			<button (click)="source.set(1)">Set 1</button>
			<button (click)="source.set(2)">Set 2</button>
			<button (click)="source.set(3)">Set 3</button>
			<button
				(click)="sourceHistory.undo()"
				[disabled]="!sourceHistory.canUndo()"
			>
				Undo
			</button>
			<button
				(click)="sourceHistory.redo()"
				[disabled]="!sourceHistory.canRedo()"
			>
				Redo
			</button>
			<button (click)="sourceHistory.reset()">Reset</button>
			<button (click)="sourceHistory.clear()">Clear</button>
		</div>
		<div>
			History:
			<pre>{{ sourceHistory.history() | json }}</pre>
		</div>
	`,
})
class TestComponent {
	readonly source = signal(0);
	readonly sourceHistory = signalHistory(this.source);
}
```

You can pass custom options to the function.

```ts
@Component()
class TestComponent implements OnInit {
	private injector = inject(Injector);

	readonly source = signal(0);

	ngOnInit() {
		const history = signalHistory(this.source, {
			capacity: 1000, // The default capacity is 100 records
			injector: this.injector,
		});
	}
}
```
