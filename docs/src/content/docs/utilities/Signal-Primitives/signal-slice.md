---
title: signalSlice
description: Declarative signal state where every way to update the state is declared up front with observable sources and actions.
entryPoint: ngxtension/signal-slice
badge: stable
contributors: ['josh-morony']
---

`signalSlice` creates a **read-only** state signal and declares, up front, every way that state can change: `sources` (streams that update it automatically) and `actionSources` (actions you call). It is loosely inspired by Redux Toolkit's `createSlice`. Because there is no `set()`, all updates are visible in one place.

## Usage

```angular-ts
import { Component, inject, Injectable } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { map, Observable, of } from 'rxjs';

interface Checklist {
	id: string;
	title: string;
}

interface ChecklistsState {
	checklists: Checklist[];
	loaded: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChecklistApi {
	load(): Observable<Checklist[]> {
		return of([{ id: '1', title: 'Groceries' }]);
	}
}

@Component({
	selector: 'app-checklists',
	template: `
		@if (state.loaded()) {
			@for (checklist of state.checklists(); track checklist.id) {
				<p>
					{{ checklist.title }}
					<button (click)="state.remove(checklist.id)">Remove</button>
				</p>
			}
		}
		<button (click)="state.add({ id: '2', title: 'Packing' })">Add</button>
	`,
})
export class Checklists {
	private readonly api = inject(ChecklistApi);

	private readonly initialState: ChecklistsState = {
		checklists: [],
		loaded: false,
	};

	readonly state = signalSlice({
		initialState: this.initialState,
		sources: [
			this.api.load().pipe(map((checklists) => ({ checklists, loaded: true }))),
		],
		actionSources: {
			add: (state, action$: Observable<Checklist>) =>
				action$.pipe(
					map((checklist) => ({
						checklists: [...state().checklists, checklist],
					})),
				),
			remove: (state, action$: Observable<string>) =>
				action$.pipe(
					map((id) => ({
						checklists: state().checklists.filter((c) => c.id !== id),
					})),
				),
		},
	});
}
```

`state` is a normal read-only signal (`state().loaded`), and every top-level property of `initialState` also gets its own `computed` selector (`state.loaded()`).

:::note
Call `signalSlice` in an injection context (a field initializer or constructor). It uses `DestroyRef` to clean up its subscriptions.
:::

## Sources

Use `sources` for streams that update the state on their own, like an HTTP request or a websocket. Each emission must be a partial of the state; it is merged into the current state.

```ts
readonly state = signalSlice({
	initialState: this.initialState,
	sources: [
		this.api.load().pipe(map((checklists) => ({ checklists, loaded: true }))),
	],
});
```

To use the current state inside a source, pass a function that receives the state signal and returns the stream:

```ts
readonly state = signalSlice({
	initialState: this.initialState,
	sources: [
		(state) =>
			this.newChecklist$.pipe(
				map((checklist) => ({
					checklists: [...state().checklists, checklist],
				})),
			),
	],
});
```

The state signal passed to these functions also has an observable for each top-level property (`state.checklists$`), so a source can react to another part of the state.

### Lazy sources

`lazySources` work like `sources`, but they are only connected the first time you read the state or one of its properties. Use them to avoid loading data that nobody displays.

```ts
readonly state = signalSlice({
	initialState: this.initialState,
	lazySources: [this.api.load().pipe(map((checklists) => ({ checklists, loaded: true })))],
});
```

## Action sources

Use `actionSources` for updates you trigger yourself. Each entry receives the state signal and a stream of the action's payloads, and returns a stream of partial state. `signalSlice` turns each entry into a method with the same name:

```ts
this.state.add({ id: '3', title: 'Chores' });
this.state.remove('3');
```

An action can also take an observable instead of a value. Every emission is dispatched as an action.

Every action returns a `Promise` that resolves with the updated state:

```ts
const updated = await this.state.add(checklist);
```

### Actions without a payload

Type the stream as `Observable<void>` to create an action you call with no arguments, for example a manual reload:

```ts
readonly state = signalSlice({
	initialState: this.initialState,
	actionSources: {
		load: (_state, action$: Observable<void>) =>
			action$.pipe(
				switchMap(() => this.api.load()),
				map((checklists) => ({ checklists, loaded: true })),
			),
	},
});

// later
this.state.load();
```

If the data should load as soon as the component starts, put the stream in `sources` instead; you don't need an action for it.

### External subjects

You can also pass an existing `Subject` as an action source. Calling the action calls `next()` on the subject. This is useful when one of your `sources` needs to react to that action, because sources can't react to actions created inside `actionSources`.

```ts
readonly reset$ = new Subject<void>();

readonly state = signalSlice({
	initialState: this.initialState,
	sources: [this.reset$.pipe(map(() => this.initialState))],
	actionSources: {
		reset: this.reset$,
	},
});

// later
this.state.reset();
```

## Action streams

Each action is also exposed as an observable named after it with a `$` suffix:

```ts
this.state.add$.subscribe((checklist) => console.log('added', checklist));
```

## Action updates

:::caution[Experimental]
Action updates may change or be removed. Feedback is welcome in a GitHub issue.
:::

Each action also gets a `<name>Updated` signal. It starts at `0` and goes up every time the action dispatches a value (and once more when an observable you passed to the action completes). Use it to run an effect after an action:

```ts
effect(() => {
	if (this.state.loadUpdated()) {
		// runs after load() is called, not on init
	}
});
```

## Selectors

Every top-level property of `initialState` is a selector by default. Add derived values with `selectors`, so all selectors live on the state object:

```ts
readonly state = signalSlice({
	initialState: this.initialState,
	selectors: (state) => ({
		count: () => state().checklists.length,
		isEmpty: () => state.loaded() && state().checklists.length === 0,
	}),
});

// in the template: {{ state.count() }}
```

Each selector is wrapped in `computed`.

## Effects

:::caution[Deprecated]
The `effects` option is deprecated and will be removed. Use a standard Angular `effect` outside of `signalSlice` instead.
:::

```ts
constructor() {
	effect(() => {
		if (this.state.loaded()) {
			// do something
		}
	});
}
```

## API

```ts
// simplified signature
function signalSlice<TState, TActionSources, TSelectors>(config: {
	initialState: TState;
	sources?: Array<
		Observable<Partial<TState>> | ((state) => Observable<Partial<TState>>)
	>;
	lazySources?: Array<
		Observable<Partial<TState>> | ((state) => Observable<Partial<TState>>)
	>;
	actionSources?: {
		[name: string]:
			| Subject<any>
			| ((
					state: Signal<TState>,
					action$: Observable<any>,
			  ) => Observable<Partial<TState>>);
	};
	selectors?: (state) => { [name: string]: () => any };
	/** @deprecated */
	effects?: (state) => { [name: string]: () => void | (() => void) };
}): SignalSlice<TState, TActionSources, TSelectors>;
```

| Option          | Description                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `initialState`  | The starting state. Optional properties (`foo?: string`) aren't allowed; use `foo: string \| null`. |
| `sources`       | Streams (or functions returning streams) that emit partial state. Connected immediately.            |
| `lazySources`   | Like `sources`, but connected the first time the state is read.                                     |
| `actionSources` | Named action reducers or external subjects. Each becomes a method on the state.                     |
| `selectors`     | Function returning named selector functions. Each becomes a `computed` on the state.                |
| `effects`       | Deprecated. Use Angular `effect` instead.                                                           |

The returned object is a read-only `Signal<TState>` with these extra properties:

| Property                | Type                            | Description                                       |
| ----------------------- | ------------------------------- | ------------------------------------------------- |
| `state.<key>`           | `Signal`                        | One selector per top-level state property.        |
| `state.<key>$`          | `Observable`                    | One observable per top-level state property.      |
| `state.<selector>`      | `Signal`                        | Your custom selectors.                            |
| `state.<action>(...)`   | `(payload?) => Promise<TState>` | One method per action source.                     |
| `state.<action>$`       | `Observable`                    | The payload stream of each action.                |
| `state.<action>Updated` | `Signal<number>`                | Counter that increases on each dispatched action. |
