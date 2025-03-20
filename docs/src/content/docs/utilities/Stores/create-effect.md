---
title: createEffect
description: ngxtension/create-effect
entryPoint: ngxtension/create-effect
badge: stable
contributors: ['chau-tran', 'evgeniy-oz']
---

`createEffect` is a standalone version of [NgRx ComponentStore Effect](https://ngrx.io/guide/component-store/effect)

:::tip[From ComponentStore documentation]

- Effects isolate side effects from components, allowing for more pure components that select state and trigger updates and/or effects in ComponentStore(s).
- Effects are Observables listening for the inputs and piping them through the "prescription".
- Those inputs can either be values or Observables of values.
- Effects perform tasks, which are synchronous or asynchronous.

:::

In short, `createEffect` creates a callable function that accepts some data (imperative) or some stream of data (declarative), or none at all.

```ts
import { createEffect } from 'ngxtension/create-effect';
```

## Usage

```ts
@Component({})
export class Some {
	log = createEffect<number>(
		pipe(
			map((value) => value * 2),
			tap(console.log.bind(console, 'double is -->')),
		),
	);

	ngOnInit() {
		// start the effect
		this.log(interval(1000));
	}
}
```

### Injection Context

`createEffect` accepts an optional `Injector` so we can call `createEffect` outside of an Injection Context.

```ts
@Component({})
export class Some {
	// 1. setup an Input; we know that Input isn't resolved in constructor
	@Input() multiplier = 2;

	// 2. grab the Injector
	private injector = inject(Injector);

	ngOnInit() {
		// 3. create log effect in ngOnInit; where Input is resolved
		const log = createEffect<number>(
			pipe(
				map((value) => value * this.multiplier),
				tap(console.log.bind(console, 'multiply is -->')),
			),
			// 4. pass in the injector
			{ injector: this.injector },
		);

		// 5. start the effect
		log(interval(1000));
	}
}
```

### Resubscribe on errors

By default, `createEffect()` will re-subscribe on errors, using `retry()` operator.  
This behavior can be configured or turned off, using optional second argument:

```ts
@Component({})
export class Example {
	// Will not resubscribe on error
	private loadProducts = createEffect<string>(
		(_) => _.pipe(switchMap((id) => this.api.loadProducts(id))),
		{ retryOnError: false },
	);

	// Will resubscribe on error with a delay, not more than 3 times
	private loadProducts = createEffect<string>(
		(_) => _.pipe(switchMap((id) => this.api.loadProducts(id))),
		{ retryOnError: { count: 3, delay: 500 } },
	);
}
```
