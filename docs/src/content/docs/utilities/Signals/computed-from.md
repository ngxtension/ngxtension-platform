---
title: computedFrom
description: ngxtension/computed-from
badge: stable
contributor: enea-jahollari
---

`computedFrom` is a helper function that combines the values of `Observable`s or `Signal`s and emits the combined value.
It also gives us the possibility to change the combined value before emitting it using rxjs operators.

It is similar to `combineLatest`, but it also takes `Signals` into consideration.

```ts
import { computedFrom } from 'ngxtension/computed-from';
```

:::tip[Inside story of the function]
Read more here: [A sweet spot between signals and observables 🍬](https://itnext.io/a-sweet-spot-between-signals-and-observables-a3c9620768f1)
:::

## Usage

`computedFrom` accepts an array or object of `Observable`s or `Signal`s and returns a `Signal` that emits the combined value of the `Observable`s or `Signal`s.
By default, it needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the third argument `options` object.
If your Observable doesn't emit synchronously, you can use the `startWith` operator to change the starting value, or pass an `initialValue` in the third argument `options` object.

```ts
const a = signal(1);
const b$ = new BehaviorSubject(2);

// array type
const combined = computedFrom([a, b$]);
console.log(combined()); // [1, 2]

// object type
const combined = computedFrom({ a, b: b$ });
console.log(combined()); // { a: 1, b: 2 }
```

It can be used in multiple ways:

1. Combine multiple `Signal`s
2. Combine multiple `Observable`s
3. Combine multiple `Signal`s and `Observable`s
4. Using initialValue param
5. Use it outside of an injection context

### 1. Combine multiple `Signal`s

We can use `computedFrom` to combine multiple `Signal`s into one `Signal`, which will emit the combined value of the `Signal`s.

```ts
const page = signal(1);
const filters = signal({ name: 'John' });

const combined = computedFrom([page, filters]);

console.log(combined()); // [1, { name: 'John' }]
```

At this point we still don't get any benefit from using `computedFrom` because we can already combine multiple `Signal`s using `computed` function.
But, what's better is that `computedFrom` allows us to change the combined value before emitting it using rxjs operators (applying asynchronous operations), which is not possible with `computed`.

```ts
import { computedFrom } from 'ngxtension/computed-from';
import { delay, of, pipe, switchMap } from 'rxjs';

let a = signal(1);
let b = signal(2);

let c = computedFrom(
	[a, b],
	pipe(
		switchMap(
			([a, b]) =>
				// of(a + b) is supposed to be an asynchronous operation (e.g. http request)
				of(a + b).pipe(delay(1000)) // delay the emission of the combined value by 1 second for demonstration purposes
		)
	)
);

effect(() => console.log(c())); // 👈 will throw an error!! 💥

setTimeout(() => {
	a.set(3);
}, 3000);

// You can copy the above example inside an Angular constructor and see the result in the console.
```

This will _throw an error_ because the operation pipeline will produce an observable that will **not have a sync value** because they emit their values later on, so the resulting `c` signal doesn't have an initial value, and this causes the error.

You can solve this by using the `initialValue` param in the third argument `options` object, to define the starting value of the resulting Signal and _prevent throwing an error_ in case of _real async_ observable.

```ts
let c = computedFrom(
	[a, b],
	pipe(
		switchMap(
			([a, b]) => of(a + b).pipe(delay(1000)) // later async emit value
		),
		{ initialValue: 42 } // 👈 pass the initial value of the resulting signal
	)
);
```

This works, and you can copy the above example inside a component constructor and see the result in the console:

```ts
42 - // initial value passed as third argument
	3 - // combined value after 1 second
	5; // combined value after 3 seconds
```

Another way to solve this problem is using the `startWith` rxjs operator in the pipe to force the observable to have a starting value like below.

```ts
let c = computedFrom(
	[a, b],
	pipe(
		switchMap(([a, b]) => of(a + b).pipe(delay(1000))),
		startWith(0) // 👈 change the starting value (emits synchronously)
	)
);
```

The console log will be:

```ts
0 - // starting value (initial sync emit)
	3 - // combined value after 1 second
	5; // combined value after 3 seconds
```

### 2. Combine multiple `Observable`s

We can use `computedFrom` to combine multiple `Observable`s into one `Signal`, which will emit the combined value of the `Observable`s.

```ts
const page$ = new BehaviorSubject(1);
const filters$ = new BehaviorSubject({ name: 'John' });

const combined = computedFrom([page$, filters$]);

console.log(combined()); // [1, { name: 'John' }]
```

This is just a better version of:

```ts
const combined = toSignal(combineLatest([page$, filters$]));
```

And it can be used in the same way as in the previous example with rxjs operators.

### 3. Combine multiple `Signal`s and `Observable`s

This is where `computedFrom` shines. We can use it to combine multiple `Signal`s and `Observable`s into one `Signal`.

```ts
const page = signal(1);
const filters$ = new BehaviorSubject({ name: 'John' });

const combined = computedFrom([page, filters$]);
console.log(combined()); // [1, { name: 'John' }]

// or using the object notation
const combinedObject = computedFrom({ page, filters: filters$ });
console.log(combinedObject()); // { page: 1, filters: { name: 'John' } }
```

:::note[Tricky part]
For `Observable`s that don't emit synchronously `computedFrom` will **throw an error** forcing you to fix this situation either by passing an `initialValue` in the third argument, or using `startWith` operator to force observable to have a sync starting value.
:::

```ts
const page$ = new Subject<number>(); // Subject doesn't have an initial value
const filters$ = new BehaviorSubject({ name: 'John' });
const combined = computedFrom([page$, filters$]); // 👈 will throw an error!! 💥
```

But, we can always use the `startWith` operator to change the initial value.

```ts
const combined = computedFrom([
	page$.pipe(startWith(0)), // change the initial value to 0
	filters$,
]);

console.log(combined()); // [0, { name: 'John' }]
```

### 4. Using initialValue param

Or you can pass `initialValue` to `computedFrom` in the third argument `options` object, to define the starting value of the resulting Signal and **prevent throwing error** in case of observables that emit later.

```ts
const combined = computedFrom(
	[page$, filters$],
	swithMap(([page, filters]) => this.dataService.getArrInfo$(page, filters)),
	{ initialValue: [] as Info[] } // define the initial value of resulting signal
); // inferred ad Signal<Info[]>
```

### 5. Use it outside of an injection context

By default, `computedFrom` needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the third argument `options` object.

```ts
@Component()
export class MyComponent {
	private readonly injector = inject(Injector);
	private readonly dataService = inject(DataService);

	// we can read the userId inside ngOnInit and not in the constructor
	@Input() userId!: number;

	data!: Signal<string[]>;

	ngOnInit() {
		// not an injection context
		const page = signal(1);
		const filters$ = new BehaviorSubject({ name: 'John' });

		this.data = computedFrom(
			[page, filters$],
			pipe(
				switchMap(([page, filters]) => this.dataService.getUserData(this.userId, page, filters)),
				startWith([] as string[]) // change the initial value
			),
			{ injector: this.injector } // 👈 pass the injector in the options object
		);
	}
}
```
