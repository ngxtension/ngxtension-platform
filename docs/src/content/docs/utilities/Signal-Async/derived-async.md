---
title: derivedAsync
description: A computed signal whose value comes from a Promise or Observable, re-run whenever the signals it reads change.
entryPoint: ngxtension/derived-async
badge: deprecated
contributors: ['enea-jahollari']
---

:::caution[Deprecated]
`derivedAsync` will be discontinued. For new code, use Angular's own resource APIs instead: [`resource`](https://angular.dev/guide/signals/resource) for Promises, [`rxResource`](https://angular.dev/api/core/rxjs-interop/rxResource) for Observables and [`httpResource`](https://angular.dev/guide/http/http-resource) for `HttpClient` requests.
:::

`derivedAsync` is like `computed`, but the callback can return a `Promise` or an `Observable`. The resulting signal holds the latest resolved value. Whenever a signal read inside the callback changes, the callback runs again, and by default the previous request is dropped (`switchMap`-style).

## Usage

```angular-ts
import { Component, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { derivedAsync } from 'ngxtension/derived-async';

interface Movie {
	id: string;
	title: string;
}

@Component({
	selector: 'app-movie-card',
	template: `<h2>{{ movie()?.title }}</h2>`,
})
export class MovieCard {
	private readonly http = inject(HttpClient);

	readonly movieId = input.required<string>();

	readonly movie = derivedAsync(() =>
		this.http.get<Movie>(`/api/movies/${this.movieId()}`),
	);
}
```

`movie` is `Signal<Movie | undefined>`: it is `undefined` until the first response arrives. When `movieId` changes, the previous Observable is unsubscribed (which cancels an `HttpClient` request) and a new one starts.

## Promises

Return a `Promise` the same way:

```ts
readonly movie = derivedAsync(() =>
	fetch(`/api/movies/${this.movieId()}`).then((r) => r.json() as Promise<Movie>),
);
```

When `movieId` changes, the result of the previous Promise is ignored. The `fetch` itself is not aborted.

## Initial value

Pass `initialValue` to avoid `undefined` before the first value arrives. The signal type then no longer includes `undefined`:

```ts
readonly tasks = derivedAsync(
	() => this.http.get<Task[]>(`/api/tasks?userId=${this.userId()}`),
	{ initialValue: [] },
); // Signal<Task[]>
```

## Require a synchronous first value

If your Observable emits synchronously on subscribe (for example with `startWith`), set `requireSync: true`. The first value is available immediately and the type has no `undefined`:

```ts
readonly tasks: Signal<Task[]> = derivedAsync(
	() => this.tasksService.loadUserTasks(this.userId()).pipe(startWith([])),
	{ requireSync: true },
);
```

`derivedAsync` throws if the Observable doesn't emit synchronously, and `requireSync` can't be used with Promises.

This is handy for modelling loading and error states in one value:

```ts
type TasksState =
	| { status: 'loading'; result: Task[] }
	| { status: 'loaded'; result: Task[] }
	| { status: 'error'; error: unknown };

readonly state: Signal<TasksState> = derivedAsync(
	() =>
		this.tasksService.loadUserTasks(this.userId()).pipe(
			map((result): TasksState => ({ status: 'loaded', result })),
			startWith<TasksState>({ status: 'loading', result: [] }),
			catchError((error) => of<TasksState>({ status: 'error', error })),
		),
	{ requireSync: true },
);
```

## Flattening behavior

By default a new run cancels the previous one (`switch`). Use the `behavior` option to choose another strategy:

| `behavior`         | Like         | What happens when the callback runs again while the previous source is still active |
| ------------------ | ------------ | ----------------------------------------------------------------------------------- |
| `switch` (default) | `switchMap`  | The previous source is dropped.                                                     |
| `merge`            | `mergeMap`   | Both keep running; every result is applied as it arrives.                           |
| `concat`           | `concatMap`  | The new source waits until the previous one completes.                              |
| `exhaust`          | `exhaustMap` | The new source is ignored until the previous one completes.                         |

```ts
readonly movie = derivedAsync(
	() => this.http.get<Movie>(`/api/movies/${this.movieId()}`),
	{ behavior: 'concat' },
);
```

## Previous value

The callback receives the current value of the signal as its argument:

```ts
readonly tasks = derivedAsync(
	(previousTasks) => {
		// use previousTasks, for example to append a new page
		return this.http.get<Task[]>(`/api/tasks?userId=${this.userId()}`);
	},
	{ initialValue: [] as Task[] },
);
```

## Outside an injection context

`derivedAsync` creates an `effect`, so it needs an injection context. Elsewhere, pass an `injector`:

```ts
private readonly injector = inject(Injector);

ngOnInit() {
	this.tasks = derivedAsync(
		() => this.http.get<Task[]>(`/api/tasks?userId=${this.userId()}`),
		{ injector: this.injector },
	);
}
```

## Errors

If the Promise rejects or the Observable errors, reading the signal throws that error. Handle errors inside the callback (`catchError`, `.catch()`) if you want to recover. After an error the internal stream is closed, so later changes don't produce new values.

## API

```ts
function derivedAsync<T>(
	computation: (
		previousValue?: T,
	) => Promise<T> | Observable<T> | T | undefined,
	options?: {
		initialValue?: T;
		requireSync?: boolean;
		behavior?: 'switch' | 'merge' | 'concat' | 'exhaust';
		injector?: Injector;
		equal?: ValueEqualityFn<T>;
	},
): Signal<T | undefined>; // Signal<T> with initialValue or requireSync
```

| Option         | Type                                           | Default         | Description                                                                          |
| -------------- | ---------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `initialValue` | `T`                                            | `undefined`     | Value before the first result arrives.                                               |
| `requireSync`  | `boolean`                                      | `false`         | Read the first value synchronously. Throws if the source doesn't emit synchronously. |
| `behavior`     | `'switch' \| 'merge' \| 'concat' \| 'exhaust'` | `'switch'`      | How overlapping runs are flattened.                                                  |
| `injector`     | `Injector`                                     | current context | Needed outside an injection context.                                                 |
| `equal`        | `ValueEqualityFn<T>`                           | `Object.is`     | Equality function for the returned signal.                                           |

## Migrate to Angular's resource APIs

The resource APIs give you the value plus `isLoading()`, `error()` and `reload()`. Move the signals you read into `params` and the request into the loader:

```ts
import { rxResource } from '@angular/core/rxjs-interop';

// before
readonly movie = derivedAsync(() =>
	this.http.get<Movie>(`/api/movies/${this.movieId()}`),
);

// after (Angular 20+)
readonly movie = rxResource({
	params: () => ({ id: this.movieId() }),
	stream: ({ params }) => this.http.get<Movie>(`/api/movies/${params.id}`),
});
// in the template: movie.value(), movie.isLoading(), movie.error()
```

For Promises, use `resource({ params, loader })`; its `abortSignal` lets you cancel the previous `fetch`. For plain `HttpClient` GET requests, [`httpResource`](https://angular.dev/guide/http/http-resource) is shorter still. Resources always cancel the previous load when params change, like the `switch` behavior. In Angular 19, `params` is called `request` and `stream` is called `loader`.

## Testing

`derivedAsync` has an extensive test suite; see the [derivedAsync tests](https://github.com/ngxtension/ngxtension-platform/blob/main/libs/ngxtension/derived-async/src/derived-async.spec.ts) for examples of testing code that uses it.
