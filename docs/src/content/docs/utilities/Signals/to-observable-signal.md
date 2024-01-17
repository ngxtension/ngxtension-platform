---
title: toObservableSignal
description: ngxtension/to-observable-signal
entryPoint: to-observable-signal
badge: stable
contributor: evgeniy-oz
---

`toObservableSignal()` combines the functionality of Angular Signal and RxJS Observable.

This function uses `toObservable()` from `@angular/core/rxjs-interop` under the hood, so it should be called in an injection context, or the `injector` should be passed as the second argument (options).

```ts
import { toObservableSignal } from 'ngxtension/to-observable-signal';
```

## Usage

```ts
@Component({
	selector: 'my-app',
	standalone: true,
	imports: [CommonModule],
	template: `
		<h2>Signal A: {{ a() }}</h2>
		<h2>Observable A: {{ a | async }}</h2>
		<h2>Observable B (A*2): {{ b | async }}</h2>
		<h2>Signal C (A*3): {{ c() }}</h2>
	`,
})
export class App {
	a = toObservableSignal(signal<number>(0));
	b = this.a.pipe(
		switchMap((v) => {
			return of(v * 2);
		}),
	);
	c = computed(() => this.a() * 3);

	constructor() {
		setInterval(() => this.a.set(1), 10000);
		setInterval(() => this.a.update((v) => v + 1), 1000);
	}
}
```

`toObservableSignal()` accepts a `Signal` or `WritableSignal` as the first argument.  
The second argument is optional - it is a `ToObservableOptions` object, which is the exact type used by `toObservable()`. Here, you can set the injector.
