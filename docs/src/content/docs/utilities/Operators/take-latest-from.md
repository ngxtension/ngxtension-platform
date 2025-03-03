---
title: takeLatestFrom
description: ngxtension/take-latest-from
entryPoint: ngxtension/take-latest-from
badge: stable
contributors: ['evgeniy-oz']
---

`takeLatestFrom()` is a modification of `withLatestFrom()` operator.

Every time the source observable emits, `takeLatestFrom()` waits for the provided observables to emit a value, and when each of them has emitted, `takeLatestFrom()` emits and unsubscribes from the provided observables.

## The Difference

Let's say we have a source observable `src$` and a provided observable `data$`.

```ts
src$.pipe(whitLatestFrom(data$)).subscribe();
```

Cases when `withLatestFrom()` will not emit when `src$` emits:

- if `data$` is a cold observable and emitted before `src$` emitted - the next time `withLatestFrom()` will emit is when `data$` emits;
- if `data$` emitted after `src$` emitted (`data$` can be hot or cold) - the next time `withLatestFrom()` will emit is when `src$` emits.

## Usage

You would use `takeLatestFrom()` when you have some observable, and every time it emits, you want to attach the latest values from some other observables and handle them. If these other observables don't have a value yet, you would like to wait until they emit at least one value (each).

### Example:

```ts
class ExampleStore {
	private readonly dataSrv = inject(DataService);
	private readonly userSrv = inject(UserService);

	public readonly updateData = createEffect<DataType>((_) =>
		_.pipe(
			takeLatestFrom(() => [this.dataSrv.getData(), this.userSrv.getUser()]),
			exhaustMap(([newData, oldData, user]) =>
				this.dataSrv.updateData(merge({}, oldData, newData), user),
			),
		),
	);
}
```
