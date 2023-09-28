---
title: computedFrom
description: ngxtension/computed-from
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
By default, it needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` as the third argument.

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
4. Use it outside of an injection context

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

effect(() => console.log(c()));

setTimeout(() => {
	a.set(3);
}, 3000);

// You can copy the above example inside an Angular constructor and see the result in the console.
```

The console log will be:

```ts
-[1, 2] - // initial value
	3 - // combined value after 1 second
	5; // combined value after 3 seconds
```

As we can see, the first value will not be affected by the rxjs operators, because they are asynchronous and the first value is emitted synchronously.
In order to change the first value, we can use startWith operator.

```ts
let c = computedFrom(
	[a, b],
	pipe(
		switchMap(([a, b]) => of(a + b).pipe(delay(1000))),
		startWith(0) // change the first value
	)
);
```

The console log will be:

```ts
-0 - // initial value
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
For `Observable`s that don't emit synchronously, `computedFrom` will give us null as the initial value for the `Observable`s.
:::

```ts
const page$ = new Subject<number>(); // Subject doesn't have an initial value
const filters$ = new BehaviorSubject({ name: 'John' });
const combined = computedFrom([page$, filters$]);

console.log(combined()); // [null, { name: 'John' }]
```

But, we can always use the `startWith` operator to change the initial value.

```ts
const combined = computedFrom([
	page$.pipe(startWith(0)), // change the initial value to 0
	filters$,
]);

console.log(combined()); // [0, { name: 'John' }]
```

### 4. Use it outside of an injection context

By default, `computedFrom` needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` as the third argument.

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
			this.injector // 👈 pass the injector as the third argument
		);
	}
}
```
