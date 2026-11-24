---
title: injectDestroy
description: An Observable that emits when the current component, directive or service is destroyed, for use with takeUntil.
entryPoint: ngxtension/inject-destroy
badge: stable
contributors: ['enea-jahollari']
---

`injectDestroy` returns an Observable that emits once and completes when the current component, directive or service is destroyed. Pass it to `takeUntil()` to end subscriptions without implementing `OnDestroy` or managing a `Subject` yourself.

## Usage

This is the pattern it replaces:

```ts
export class UserList implements OnInit, OnDestroy {
	private userService = inject(UserService);
	private destroy$ = new Subject<void>();

	ngOnInit() {
		this.userService
			.getUsers()
			.pipe(takeUntil(this.destroy$))
			.subscribe((users) => (this.users = users));
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
```

With `injectDestroy`, you create `destroy$` in a field initializer and drop `ngOnDestroy`:

```angular-ts
import { Component, inject, OnInit } from '@angular/core';
import { injectDestroy } from 'ngxtension/inject-destroy';
import { takeUntil } from 'rxjs';

@Component({ selector: 'app-user-list', template: '...' })
export class UserList implements OnInit {
	private userService = inject(UserService);
	private destroy$ = injectDestroy();

	users: User[] = [];

	ngOnInit() {
		this.userService
			.getUsers()
			.pipe(takeUntil(this.destroy$))
			.subscribe((users) => (this.users = users));
	}
}
```

Because `destroy$` is created in an injection context, you can use it later anywhere in the class: in `ngOnInit`, event handlers or other methods.

## Register destroy callbacks

The returned Observable also has an `onDestroy()` method, the same as `DestroyRef.onDestroy`, for other cleanup logic.

```ts
export class Chart {
	private destroy$ = injectDestroy();

	ngOnInit() {
		const chart = createChart();

		this.destroy$.onDestroy(() => chart.dispose());
	}
}
```

## Outside an injection context

Pass an `Injector` to create it somewhere else:

```ts
export class UserList {
	private injector = inject(Injector);

	ngOnInit() {
		const destroy$ = injectDestroy(this.injector);
	}
}
```

## How it works

It injects `DestroyRef` and emits on a `ReplaySubject` when it is destroyed:

```ts
const destroyRef = inject(DestroyRef);
const subject$ = new ReplaySubject<void>(1);

destroyRef.onDestroy(() => {
	subject$.next();
	subject$.complete();
});

return subject$;
```

Because it is a `ReplaySubject`, subscribing after the destroy still gets the emission, so `takeUntil(destroy$)` ends the stream right away.

## Compared to `takeUntilDestroyed`

Angular's [`takeUntilDestroyed`](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed) does the same job. Outside an injection context, such as `ngOnInit`, it needs a `DestroyRef`:

```ts
export class UserList {
	private destroyRef = inject(DestroyRef);

	ngOnInit() {
		this.userService
			.getUsers()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe();
	}
}
```

You can also create the operator once in a field initializer and reuse it:

```ts
export class UserList {
	private untilDestroyed = takeUntilDestroyed<User[]>();

	ngOnInit() {
		this.userService.getUsers().pipe(this.untilDestroyed).subscribe();
	}
}
```

Use `takeUntilDestroyed` if you prefer Angular built-ins. Use `injectDestroy` if your codebase already uses `takeUntil(destroy$)`, or if you need the destroy signal as an Observable (for example to combine it with other streams).

## API

```ts
function injectDestroy(
	injector?: Injector,
): ReplaySubject<void> & { onDestroy: DestroyRef['onDestroy'] };
```

| Parameter  | Type       | Description                                                                  |
| ---------- | ---------- | ---------------------------------------------------------------------------- |
| `injector` | `Injector` | Optional. Use it when you call `injectDestroy` outside an injection context. |
