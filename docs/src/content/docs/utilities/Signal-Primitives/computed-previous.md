---
title: computedPrevious
description: Creates a signal that holds the previous value of another signal or computation.
entryPoint: ngxtension/computed-previous
badge: stable
contributors: ['enea-jahollari']
---

`computedPrevious` gives you a signal that always holds the value a signal had before its latest change. Use it to compare old and new values, show "was / now" in the UI, or animate between two states, without wiring up an `effect` to remember the last value yourself.

## Usage

Pass a signal (or any function that reads signals). On the first read, the previous value equals the current value.

```angular-ts
import { Component, signal } from '@angular/core';
import { computedPrevious } from 'ngxtension/computed-previous';

@Component({
	selector: 'app-price',
	template: `
		<p>Price: {{ price() }} (was {{ previousPrice() }})</p>
		<button (click)="price.set(price() + 10)">Raise price</button>
	`,
})
export class Price {
	readonly price = signal(100);
	readonly previousPrice = computedPrevious(this.price);
}
```

```ts
const value = signal(1);
const previous = computedPrevious(value);

previous(); // 1 (no previous value yet, so it returns the current one)

value.set(2);
previous(); // 1

value.set(3);
previous(); // 2
```

### Track a derived value

The argument is a computation, so you can track the previous value of an expression, an `input()` or a `computed()`.

```ts
const firstName = signal('Ada');
const lastName = signal('Lovelace');

const previousFullName = computedPrevious(() => `${firstName()} ${lastName()}`);
```

## API

```ts
function computedPrevious<T>(
	computation: () => T,
	options?: CreateComputedOptions<T>,
): Signal<T>;
```

| Parameter     | Type                       | Description                                                                 |
| ------------- | -------------------------- | --------------------------------------------------------------------------- |
| `computation` | `() => T`                  | A signal or a function that reads signals. Its result is the current value. |
| `options`     | `CreateComputedOptions<T>` | Optional. Passed to the underlying `computed` (for example `equal`).        |

Returns a read-only `Signal<T>` holding the previous value.

:::note[It is a computed]
`computedPrevious` is built on `computed`, so it only updates when it is read. "Previous" means the value at the previous read. If the source changes several times between two reads, you get the last value that was read, not every intermediate one. In templates and effects this is what you want; just keep it in mind in plain code.
:::

## Related

- [`signalHistory`](/utilities/signal-primitives/signal-history/) keeps a full history with undo and redo.
- [`on`](/utilities/effects-side-effects/on/) passes the previous input values to an effect callback.
