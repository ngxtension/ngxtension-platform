---
title: CallPipe / ApplyPipe
description: Standalone Angular pipes for invoking pure functions with arguments, leveraging Angular's pure pipe memoization.
entryPoint: ngxtension/call-apply
badge: stable
contributors: ['daniele-morosinotto']
---

`CallPipe` and `ApplyPipe` let you call a function from a template through a pure pipe. Angular then only runs the
function again when its arguments change, instead of on every change detection cycle as with a plain `{{ format(date) }}`
call.

- `call` passes the piped **value** to a function: `{{ value | call: fn }}`.
- `apply` calls the piped **function** with arguments: `{{ fn | apply: arg1 : arg2 }}`.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { ApplyPipe, CallPipe } from 'ngxtension/call-apply';

@Component({
	selector: 'app-order-summary',
	imports: [CallPipe, ApplyPipe],
	template: `
		<p>Placed: {{ placedAt | call: toIso }}</p>
		<p>{{ formatPrice | apply: total : 'EUR' }}</p>
	`,
})
export class OrderSummary {
	readonly placedAt = new Date();
	readonly total = 42.5;

	readonly toIso = (date: Date) => date.toISOString();

	formatPrice(amount: number, currency: string) {
		return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
	}
}
```

`toIso` runs again only when `placedAt` changes, and `formatPrice` only when `total` or the currency changes.

## `call`: one argument

`call` takes the value on the left and passes it as the only argument to the function on the right.

```html
<b>{{ now | call: toIso }}</b>
```

## `apply`: any number of arguments

`apply` takes the function on the left and calls it with the arguments after the colons. It also works with no
arguments.

```html
<p>{{ join | apply: 'Hello' : 'world' : '!' }}</p>
<p>{{ getAnswer | apply }}</p>
```

```ts
join(...words: string[]) {
	return words.join(' ');
}

getAnswer() {
	return 42;
}
```

## Functions must be pure

Both pipes are pure, so the function must return the same output for the same arguments and must not read or change
component state. To catch mistakes, the pipes call your function with a guarded `this`: reading or writing any
property on `this` throws.

```ts
updateClock() {
	this.now = new Date(); // throws when called through | call or | apply
	return this.now;
}
```

```html
<!-- Throws: "DON'T USE this INSIDE A FUNCTION CALLED BY | call OR | apply IT MUST BE A PURE FUNCTION!" -->
<h1>{{ updateClock | apply }}</h1>
```

:::caution[Arrow functions aren't guarded]
Arrow functions keep the `this` of the component, so the guard can't catch them. An arrow function such as
`toIso = (date: Date) => this.locale + date` won't throw, but it returns stale results when `this.locale` changes,
because the pipe doesn't re-run. Keep arrow functions free of `this` too.
:::

Passing something that isn't a function throws a `TypeError`.

## API

```ts
// {{ value | call: fn }}
class CallPipe {
	transform<T, R>(value: T, fn: (param: T) => R): R;
}

// {{ fn | apply: ...args }}
class ApplyPipe {
	transform<TFunction extends (...args: any[]) => any>(
		fn: TFunction,
		...args: Parameters<TFunction>
	): ReturnType<TFunction>;
}
```

| Pipe        | Name in template | Left side       | Arguments                        | Returns                 |
| ----------- | ---------------- | --------------- | -------------------------------- | ----------------------- |
| `CallPipe`  | `call`           | `value: T`      | `fn: (param: T) => R`            | `R`                     |
| `ApplyPipe` | `apply`          | `fn: TFunction` | `...args: Parameters<TFunction>` | `ReturnType<TFunction>` |

## Related

- [`computed`](https://angular.dev/guide/signals#computed-signals): when the inputs are signals, a `computed` in the
  component is usually clearer than a pipe and is memoized the same way.
