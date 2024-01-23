---
title: computedAsync
description: ngxtension/computed-async
entryPoint: computed-async
badge: stable
contributors: ['enea-jahollari']
---

`computedAsync` is a helper function that allows us to compute a value based on a Promise or Observable, but also supports return regular values (that are not Promises or Observables).
It also gives us the possibility to change the behavior of the computation by choosing the flattening strategy (switch, merge, concat, exhaust) and the initial value of the computed value.

```ts
import { computedAsync } from 'ngxtension/computed-async';
```

## Usage

`computedAsync` accepts a function that returns a `Promise`, `Observable`, or a regular value, and returns a `Signal` that emits the computed value.

#### Example with Promise (fetch)

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

#### Example with Observable (HttpClient)

When we return an `Observable`, it will be automatically subscribed to, and will be unsubscribed when the component is destroyed.

In the example below, if the `movieId` changes, the previous computation will be cancelled (if it's an API call, it's going to be cancelled too), and a new one will be triggered.

```ts movie-card.ts
import { inject } from '@angular/core';

export class MovieCard {
	private http = inject(HttpClient);

	movieId = input.required<string>();

	movie = computedAsync(() =>
		this.http.get(`https://localhost/api/movies/${this.movieId()}`),
	);
}
```

#### Example with regular value

```ts movie-card.ts
export class MovieCard {
	movieId = input.required<string>();

	movie = computedAsync(() => (this.movieId() ? '🍿' : '🎬'));
}
```

#### Example with initialValue

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

#### Usage outside of injection context

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
