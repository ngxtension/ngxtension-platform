---
title: onEvent
description: A small utility to add DOM/EventTarget listeners with automatic cleanup via DestroyRef.
entryPoint: ngxtension/on-event
badge: stable
contributors: ['endlacer']
---

A small utility for listening to events on any `EventTarget` with automatic cleanup when the current Angular lifecycle
scope is destroyed (via `DestroyRef.onDestroy`).
It uses an `AbortController` and passes its `signal` to `addEventListener`, so aborting removes the listener without
needing `removeEventListener`.

## Usage

### Basic Usage with Auto-Cleanup

Listen to an event and auto-cleanup on destroy (when called inside an injection context):

```ts
import { onEvent } from 'ngxtension/on-event';

onEvent(window, 'resize', (event) => {
	console.log('Window resized', event);
});
```

### Manual Control (Abort inside callback)

Stop listening manually (e.g., after the first "meaningful" event):

```ts
onEvent(document, 'scroll', (event, abort) => {
	if (window.scrollY > 500) {
		console.log('User scrolled past 500px');
		abort(); // removes the listener immediately
	}
});
```

### Control via Return Value

You can control the listener from outside the callback using the returned object. This is useful for UI feedback based
on the listener's state.

```ts
const { removeListener, active } = onEvent(window, 'mousemove', (e) => {
	// heavy logic
});

// Check if we are currently listening (returns Signal<boolean>)
console.log(active()); // true

// Stop listening from outside
removeListener();

console.log(active()); // false
```

## Options

```ts
type OnEventOptions = {
	once?: boolean;
	capture?: boolean;
	passive?: boolean;
};
```

- `once`: Uses the native `addEventListener({ once: true })` behavior (listener runs once and is then removed).
- `capture`: A boolean indicating that events of this type will be dispatched to the registered listener before being
  dispatched to any EventTarget beneath it in the DOM tree.
- `passive`: A boolean which, if true, indicates that the function specified by listener will never call
  `preventDefault()`.
- `destroyRef`: Provide a `DestroyRef` explicitly (useful outside injection context, or when you want a specific
  lifecycle scope).
- `injector`: Provide an `Injector` explicitly so the utility can resolve `DestroyRef` from it when you're not in a
  direct injection context.

## Injection notes

If you call `onEvent()` somewhere without an active injection context (for example, inside a plain function that isn't
run via Angular DI), pass either:

- `options.destroyRef`, or
- `options.injector`.

If no `DestroyRef` can be determined, a warning will be logged in DevMode, and the listener will **not** be
automatically cleaned up (you must call `removeListener` manually).

## API

```ts
export type OnEventResult = {
	removeListener: () => void;
	active: Signal<boolean>;
}

onEvent(target: EventTarget, eventKey: string, listener: (event: Event, abort: () => void) => void, options?: OnEventOptions): OnEventResult;
```

### Arguments

- `target`: The DOM element or EventTarget (e.g., `window`, `document`, `ElementRef.nativeElement`).
- `eventKey`: The name of the event (e.g., `'click'`, `'scroll'`).
- `listener`: The callback function. Receives:
  - `event`: The dispatched event (typed via `GlobalEventHandlersEventMap` when possible).
  - `abort()`: Call to stop listening immediately.
- `options`: Configuration object for event behavior and dependency injection.

### Return Value

Returns an `OnEventResult` object:

- `removeListener`: A function to remove the event listener manually.
- `active`: A generic Angular `Signal<boolean>` indicating whether the listener is currently attached.
