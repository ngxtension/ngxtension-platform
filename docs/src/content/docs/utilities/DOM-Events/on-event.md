---
title: onEvent
description: A small utility to add DOM/EventTarget listeners with automatic cleanup via DestroyRef.
entryPoint: ngxtension/on-event
badge: stable
contributors: ['endlacer']
sidebar:
  order: 50
---

`onEvent` adds an event listener to any `EventTarget` (`window`, `document`, an element) and removes it for you when
the component, directive or service that created it is destroyed. You can also stop listening at any time, from inside
or outside the callback.

Under the hood it passes an `AbortController` signal to `addEventListener`, so aborting removes the listener without
calling `removeEventListener`. Cleanup is registered with `DestroyRef.onDestroy`.

## Usage

Call `onEvent` in an injection context, such as a field initializer or the constructor. The event type is inferred from
the event name, so `event` below is a `KeyboardEvent`.

```angular-ts
import { Component, signal } from '@angular/core';
import { onEvent } from 'ngxtension/on-event';

@Component({
	selector: 'app-shortcuts',
	template: `
		<p>Last key: {{ lastKey() }}</p>
	`,
})
export class Shortcuts {
	readonly lastKey = signal('none');

	constructor() {
		onEvent(document, 'keydown', (event) => {
			this.lastKey.set(event.key);
		});
	}
}
```

The listener is removed when `Shortcuts` is destroyed.

### Basic usage with auto-cleanup

Listen to an event and clean up on destroy (when called inside an injection context):

```ts
import { onEvent } from 'ngxtension/on-event';

onEvent(window, 'resize', (event) => {
	console.log('Window resized', event);
});
```

### Stop from inside the callback

The callback receives an `abort` function as its second argument. Call it to stop listening, for example after the
first meaningful event:

```ts
onEvent(document, 'scroll', (event, abort) => {
	if (window.scrollY > 500) {
		console.log('User scrolled past 500px');
		abort(); // removes the listener immediately
	}
});
```

### Stop from outside with the returned ref

`onEvent` returns `destroy()` to remove the listener and an `active` signal that tells you whether it is still
attached. Use them to control the listener from elsewhere or to show its state in the UI.

```ts
const { destroy, active } = onEvent(window, 'mousemove', (e) => {
	// heavy logic
});

// Check if we are currently listening (Signal<boolean>)
console.log(active()); // true

// Stop listening from outside
destroy();

console.log(active()); // false
```

### Listen once

With `once: true`, the native `once` option removes the listener after the first event, and `active` becomes `false`.

```ts
onEvent(window, 'load', () => console.log('loaded'), { once: true });
```

## Outside an injection context

`onEvent` needs a `DestroyRef` to clean up. If you call it outside an injection context (for example in `ngOnInit` or
in a callback), pass one of these options:

- `destroyRef`: the `DestroyRef` that should own the listener.
- `injector`: an `Injector` to resolve the `DestroyRef` from.
- `manualCleanup: true`: no automatic cleanup. You must call `destroy()` (or `abort()`) yourself.

```ts
import { Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { onEvent } from 'ngxtension/on-event';

@Component({ selector: 'app-example', template: '' })
export class Example implements OnInit {
	private readonly destroyRef = inject(DestroyRef);

	ngOnInit() {
		onEvent(window, 'resize', () => console.log('resized'), {
			destroyRef: this.destroyRef,
		});
	}
}
```

:::caution
Without an injection context and without `destroyRef`, `injector` or `manualCleanup: true`, `onEvent` throws Angular's
`NG0203` error ("inject() must be called from an injection context").
:::

You can pass only one of `destroyRef`, `injector` or `manualCleanup: true`; the type doesn't allow combining them.

## API

```ts
function onEvent(
	target: EventTarget,
	eventKey: string,
	listener: (event: Event, abort: () => void) => void,
	options?: OnEventOptions,
): OnEventRef;

type OnEventRef = {
	destroy: () => void;
	active: Signal<boolean>;
};
```

When `eventKey` is a key of `GlobalEventHandlersEventMap` (such as `'click'` or `'keydown'`), `event` is typed as the
matching event (`MouseEvent`, `KeyboardEvent`, …). For other names it is `Event`, or the type you pass as a generic.

### Arguments

| Argument   | Type                                 | Description                                                             |
| ---------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `target`   | `EventTarget`                        | What to listen on: `window`, `document`, an element, any `EventTarget`. |
| `eventKey` | `string`                             | The event name, for example `'click'` or `'scroll'`.                    |
| `listener` | `(event, abort: () => void) => void` | Called for each event. Call `abort()` to stop listening.                |
| `options`  | `OnEventOptions`                     | Listener and cleanup options (below).                                   |

### Options

| Option          | Type         | Default | Description                                                                                       |
| --------------- | ------------ | ------- | ------------------------------------------------------------------------------------------------- |
| `once`          | `boolean`    | `false` | Native `once`: the listener runs once and is then removed.                                        |
| `capture`       | `boolean`    | `false` | Native `capture`: receive the event in the capture phase, before targets lower in the DOM tree.   |
| `passive`       | `boolean`    | `false` | Native `passive`: promise not to call `preventDefault()`, which lets the browser scroll smoothly. |
| `destroyRef`    | `DestroyRef` | -       | Owner of the listener. Use outside an injection context or to tie the listener to another scope.  |
| `injector`      | `Injector`   | -       | Injector to resolve `DestroyRef` from when you're not in an injection context.                    |
| `manualCleanup` | `boolean`    | `false` | When `true`, nothing is removed automatically; call `destroy()` yourself.                         |

### Return value

| Property  | Type              | Description                                                |
| --------- | ----------------- | ---------------------------------------------------------- |
| `destroy` | `() => void`      | Removes the listener.                                      |
| `active`  | `Signal<boolean>` | `true` while the listener is attached, `false` afterwards. |

## Related

- [Renderer2.listen](https://angular.dev/api/core/Renderer2#listen) is Angular's built-in way to add a listener; you
  remove it yourself by calling the function it returns.
- For host element events in a component or directive, prefer the
  [`host` property](https://angular.dev/guide/components/host-elements#binding-to-the-host-element) (for example
  `host: { '(window:resize)': 'onResize()' }`).
