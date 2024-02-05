---
title: computedAsync
description: ngxtension/computed-async
entryPoint: computed-async
badge: stable
contributors: ['enea-jahollari']
---

`computedAsync` is a helper function that allows us to compute a value based on a Promise or Observable, but also supports returning regular values (that are not Promises or Observables).
It also gives us the possibility to change the behavior of the computation by choosing the flattening strategy (switch, merge, concat, exhaust) and the initial value of the computed value.

```ts
import { computedAsync } from 'ngxtension/computed-async';
```

## Usage

`computedAsync` accepts a function that returns a `Promise`, `Observable`, or a regular value, and returns a `Signal` that emits the computed value.

### Works with Promises (fetch)

Having a `movieId` signal input, we can use `computedAsync` to fetch the movie based on the `movieId`. As soon as the `movieId` changes, the previous computation will be cancelled (if it's an API call, it's going to be cancelled too), and a new one will be triggered.

```ts movie-card.ts
export class MovieCard {
	movieId = input.required<string>();

	movie = computedAsync(() =>
		fetch(`https://localhost/api/movies/${this.movieId()}`).then((r) =>
			r.json(),
		),
	);
}
```

### Works with Observables (ex. HttpClient)

When we return an `Observable`, it will be automatically subscribed to, and will be unsubscribed when the component is destroyed (or when the computation is re-triggered).

In the example below, if the `movieId` changes, the previous computation will be cancelled (if it's an API call, it's going to be cancelled too), and a new one will be triggered.

```ts movie-card.ts
import { inject } from '@angular/core';

export class MovieCard {
	private http = inject(HttpClient);

	movieId = input.required<string>();

	movie = computedAsync(() =>
		this.http.get<Movie>(`https://localhost/api/movies/${this.movieId()}`),
	);
}
```

### Works with regular values

This doesn't bring any benefit over using a regular `computed` signal, but it's possible to return regular values (that are not Promises or Observables) from the callback function.

```ts movie-card.ts
export class MovieCard {
	movieId = input.required<string>();
	movie = computedAsync(() => (this.movieId() ? '🍿' : '🎬'));
}
```

> Note: The callback function runs in the microtask queue, so it won't emit the value immediately (will return `undefined` by default). If you want to emit the value immediately, you can use the `requireSync` option in the second argument `options` object.

### Works with `initialValue`

If we want to set an initial value for the computed value, we can pass it as the second argument in the `options` object.

```ts
import { injectQueryParams } from 'ngxtension/inject-query-params';

export class UserTasks {
	userId = injectQueryParams('userId');

	userTasks = computedAsync(
		() => fetch(`https://localhost/api/tasks?userId=${this.userId()}`),
		{ initialValue: [] },
	);
}
```

### Works with `requireSync`

If we have an observable that emits the value synchronously, we can use the `requireSync` option to emit the value immediately.
This is also useful to fix the type of the signal, so the type won't include `undefined` in the type by default.

#### Example

If you're observable emits the value synchronously, you can use the `requireSync` option to emit the value immediately.
This way you don't need the initial value, and the type of the signal will be the type of the observable.

Without `requireSync`, the type of the signal would be `Signal<UserTask[] | undefined>`, but with `requireSync`, the type of the signal will be `Signal<UserTask[]>`.

```ts
import { computedAsync } from 'ngxtension/computed-async';
import { startWith } from 'rxjs';

export class UserTasks {
	private http = inject(HttpClient);
	private tasksService = inject(TasksService);
	userId = injectQueryParams('userId');

	data: Signal<UserTask[]> = computedAsync(
		() => this.tasksService.loadUserTasks(userId()).pipe(startWith([])),
		{ requireSync: true },
	);
}
```

#### Contextual Observable example

In the example below, we have a `Signal` that represents the state of an API call.
We use `computedAsync` to compute the state of the API call based on the `userId` query parameter.

```ts
import { computedAsync } from 'ngxtension/computed-async';

export class UserTasks {
	private http = inject(HttpClient);
	private tasksService = inject(TasksService);
	userId = injectQueryParams('userId');

	data: Signal<ApiCallState<UserTask[]>> = computedAsync(
		() =>
			this.tasksService.loadUserTasks(userId()).pipe(
				map((res) => ({ status: 'loaded' as const, result: res })),
				startWith({ status: 'loading' as const, result: [] }),
				catchError((err) => of({ status: 'error' as const, error: err })),
			),
		{ requireSync: true },
	);
}

interface ApiCallLoading<TResult> {
	status: 'loading';
	result: TResult;
}
interface ApiCallLoaded<TResult> {
	status: 'loaded';
	result: TResult;
}
interface ApiCallError<TError> {
	status: 'error';
	error: TError;
}

export type ApiCallState<TResult, TError = string> =
	| ApiCallLoading<TResult>
	| ApiCallLoaded<TResult>
	| ApiCallError<TError>;
```

### Usage outside of injection context

By default, it needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the second argument `options` object.

```ts
import { inject, Injector } from '@angular/core';
import { computedAsync } from 'ngxtension/computed-async';

export class UserTasks {
	private injector = inject(Injector);
	private userId = injectQueryParams('userId');

	userTasks!: Signal<Task[]>;

	ngOnInit() {
		this.userTasks = computedAsync(
			() => fetch(`https://localhost/api/tasks?userId=${this.userId()}`),
			{ injector: this.injector },
		);
	}
}
```

### Behaviors (switch, merge, concat, exhaust)

By default, `computedAsync` uses the `switch` behavior, which means that if the computation is triggered again before the previous one is completed, the previous one will be cancelled.
If you want to change the behavior, you can pass the `behavior` option in the second argument `options` object.

```ts movie-card.ts
export class MovieCard {
	movieId = input.required<string>();

	movie = computedAsync(
		() => this.http.get(`https://localhost/api/movies/${this.movieId()}`),
		{ behavior: 'concat' /* or 'merge', 'concat', 'exhaust' */ },
	);
}
```

#### switch (default)

If we want to cancel the previous computation, we can use the `switch` behavior, which is the default behavior.
If the computation is triggered again before the previous one is completed, the previous one will be cancelled.

- Uses `switchMap` operator

#### merge

If we want to keep the previous computation, we can use the `merge` behavior.
If the computation is triggered again before the previous one is completed, the previous one will be kept, and the new one will be started.

- Uses `mergeMap` operator

#### concat

If we want to keep the previous computation, but also wait for it to complete before starting the new one, we can use the `concat` behavior.

- Uses `concatMap` operator

#### exhaust

If we want to ignore the new computation if the previous one is not completed, we can use the `exhaust` behavior.

- Uses `exhaustMap` operator

### Use with previous computed value

If we want to use the previous computed value in the next computation, we can read it in the callback function as the first argument.

```ts movie-card.ts
import { injectQueryParams } from 'ngxtension/inject-query-params';

export class UserTasks {
	private http = inject(HttpClient);
	userId = injectQueryParams('userId');

	userTasks = computedAsync(
		(previousTasks) => {
			// Use previousTasks to do something
			return this.http.get(
				`https://localhost/api/tasks?userId=${this.userId()}`,
			);
		},
		{ initialValue: [] },
	);
}
```

### How to test computedAsync

`computedAsync` is tested heavily, so look at the tests for examples on how to test it. [Github Repo computedAsync tests](https://github.com/nartc/ngxtension-platform/blob/main/libs/ngxtension/computed-async/src/computed-async.spec.ts)
