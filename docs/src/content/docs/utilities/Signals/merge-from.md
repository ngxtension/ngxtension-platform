---
title: mergeFrom
description: ngxtension/merge-from
entryPoint: merge-from
badge: stable
contributors: ['chau-tran']
---

`mergeFrom` is a helper function that merges the values of `Observable`s or `Signal`s and emits the latest emitted value.
It also gives us the possibility to change the emitted value before emitting it using RxJS operators.

It is similar to `merge()`, but it also takes `Signals` into consideration.

From `ngxtension` perspective, `mergeFrom` is similar to [`derivedFrom`](./derived-from.md), but it doesn't emit the combined value, but the latest emitted value by using the `merge` operator instead of `combineLatest`.

```ts
import { mergeFrom } from 'ngxtension/merge-from';
```

## Usage

`mergeFrom` accepts an array of `Observable`s or `Signal`s and returns a `Signal` that emits the latest value of the `Observable`s or `Signal`s.
By default, it needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the third argument `options` object.
If your Observable doesn't emit synchronously, you can use the `startWith` operator to change the starting value, or pass an `initialValue` in the third argument `options` object.

```ts
const a = signal(1);
const b$ = new BehaviorSubject(2);

// array type
const merged = mergeFrom([a, b$]);
// both sources are sync, so emits the last emitted value
console.log(merged()); // 2
```

It can be used in multiple ways:

1. Merge multiple `Signal`s
2. Merge multiple `Observable`s
3. Merge multiple `Signal`s and `Observable`s
4. Using initialValue param
5. Use it outside of an injection context

### 1. Merge multiple `Signal`s

We can use `mergeFrom` to merge multiple `Signal`s into one `Signal`, which will emit last value of the `Signal`s.

```ts
const runnerOne = signal({ name: 'Naruto' });
const runnerTwo = signal({ name: 'Goku' });

const merged = mergeFrom([runnerOne, runnerTwo]);

console.log(merged()); // [1, { name: 'Goku' }]
```

As we said before, `mergeFrom` allows us to change the last value before emitting it using rxjs operators (applying asynchronous operations).

```ts
import { mergeFrom } from 'ngxtension/merge-from';
import { delay, of, pipe, map } from 'rxjs';

const runnerOne = signal({ name: 'Naruto', time: '12:43PM' });
const runnerTwo = signal({ name: 'Goku', time: '12:44PM' });

const lastRunner = mergeFrom(
	[runnerOne, runnerTwo],
	pipe(
		switchMap((runner) => {
			return of('The last runner to arive was:  ' + runner.name).pipe(
				delay(1000),
			);
		}),
	),
);
effect(() => console.log(lastRunner())); // 👈 will throw an error!! 💥

setTimeout(() => {
	runnerOne.update((runner) => {
		return {
			...runner,
			time: '12:45PM',
		};
	});
}, 3000);

// You can copy the above example inside an Angular constructor and see the result in the console.
```

This will _throw an error_ because the operation pipeline will produce an observable that will **not have a sync value** because they emit their values later on, so the resulting `lastRunner` signal doesn't have an initial value, and this causes the error.

You can solve this by using the `initialValue` param in the third argument `options` object, to define the starting value of the resulting Signal and _prevent throwing an error_ in case of _real async_ observable.

```ts
const lastRunner = mergeFrom(
	[runnerOne, runnerTwo],
	pipe(
		switchMap((runner) => {
			return of('The last runner to arive was:  ' + runner.name).pipe(
				delay(1000),
			);
		}),
	),
	{ initialValue: 'Waiting for someone to arrive...' },
);
```

This works, and you can copy the above example inside a component constructor and see the result in the console:

```ts
  Waiting for someone to arrive...      - // initial value passed as third argument
    The last runner to arive was:  Goku   - // last value after 1 second
    The last runner to arive was:  Naruto - // last value after 3 seconds
```

Another way to solve this problem is using the `startWith` rxjs operator in the pipe to force the observable to have a starting value like below.

```ts
const lastRunner = mergeFrom(
	[runnerOne, runnerTwo],
	pipe(
		switchMap((runner) => {
			return of('The last runner to arive was:  ' + runner.name).pipe(
				delay(1000),
			);
		}),
		startWith('Waiting for someone to arrive...'),
	),
);
```

The console log will be:

```ts
  Waiting for someone to arrive...      - // initial value passed as third argument
    The last runner to arive was:  Goku   - // last value after 1 second
    The last runner to arive was:  Naruto - // last value after 3 seconds
```

### 2. Combine multiple `Observable`s

We can use `mergeFrom` to combine multiple `Observable`s into one `Signal`, which will emit the combined value of the `Observable`s.

```ts
const runnerOne$ = new BehaviorSubject({ name: 'Naruto', time: '12:43PM' });
const runnerTwo$ = new BehaviorSubject({ name: 'Goku', time: '12:44PM' });

const lastRunner = mergeFrom([runnerOne, runnerTwo]);

console.log(lastRunner()); // { name: 'Goku', time: '12:44PM' }
```

This is just a better version of:

```ts
const lastRunner = toSignal(merge([runnerOne$, runnerTwo$]));
```

And it can be used in the same way as in the previous example with rxjs operators.

### 3. Combine multiple `Signal`s and `Observable`s

We can use it to combine multiple `Signal`s and `Observable`s into one `Signal`.

```ts
const runnerOne = signal({ name: 'Naruto', time: '12:43PM' });
const runnerTwo$ = new BehaviorSubject({ name: 'Goku', time: '12:44PM' });

const lastRunner = mergeFrom([runnerOne, runnerTwo$]);

console.log(lastRunner()); // {name: 'Goku', time: '12:44PM'}
```

:::note[Tricky part]
If all `Observable`s don't emit any initial value, `mergeFrom` will **throw an error** forcing you to fix this situation either by passing an `initialValue` in the third argument, or using `startWith` operator in one of the observables to force it to have a sync starting value.
:::

```ts
const runnerOne$ = new Subject<number>();
const runnerTwo$ = new Subject<number>();

const lastRunner = mergeFrom([runnerOne$, runnerTwo$]);

console.log(lastRunner()); // 👈 will throw an error!! 💥
```

Using `startWith` operator aproach to change the initial value.

```ts
const lastRunner = mergeFrom([
	runnerOne$.pipe(startWith({ name: 'Naruto', time: '12:43PM' })),
	runnerTwo$,
]);

console.log(lastRunner()); // {name: 'Naruto', time: '12:43PM'}
```

Or, we can set `initialValue` as the third argument operator to change the initial value.

```ts
const lastRunner = mergeFrom([runnerOne$, runnerTwo$], undefined, {
	initialValue: { name: 'Naruto', time: '12:43PM' },
});

console.log(lastRunner()); // {name: 'Naruto', time: '12:43PM'}
```

### 4. Using initialValue param

Or, you can set the `initialValue` as the third argument in the `options` object, to define the starting value of the resulting Signal and **prevent throwing error** in case of observables that emit later.

```ts
const lastRunner = mergeFrom([runnerOne$, runnerTwo$], undefined, {
	initialValue: { name: 'Naruto', time: '12:43PM' },
});

console.log(lastRunner()); // {name: 'Naruto', time: '12:43PM'}
```

### 5. Use it outside of an injection context

By default, `mergeFrom` needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the third argument `options` object.

```ts
@Component()
export class MyComponent implements OnInit {
	readonly injector = inject(Injector);
	ngOnInit(): void {
		const runnerTwo$ = new Subject<number>();
		const runnerOne$ = new Subject<number>();

		const lastRunner = mergeFrom([runnerOne$, runnerTwo$], undefined, {
			initialValue: { name: 'Naruto', time: '12:43PM' },
			injector: this.injector,
		});

		console.log(lastRunner()); // {name: 'Naruto', time: '12:43PM'}
	}
}
```
