---
title: createInjectable
description: A function based approach for creating Injectable services
entryPoint: ngxtension/create-injectable
badge: experimental
contributors: ['josh-morony', 'chau-tran']
---

`createInjectable` lets you write an Angular service as a plain function instead of a decorated class. The object your function returns is the service's public API; everything else stays private in the closure. Behind the scenes it creates an `@Injectable` class, so you inject it with `inject()` as usual.

## Usage

```ts title="counter.service.ts"
import { computed, signal } from '@angular/core';
import { createInjectable } from 'ngxtension/create-injectable';

export const CounterService = createInjectable(() => {
	const count = signal(0); // private

	return {
		count: count.asReadonly(),
		double: computed(() => count() * 2),
		increment: () => count.update((c) => c + 1),
	};
});
```

```angular-ts
import { Component, inject } from '@angular/core';
import { CounterService } from './counter.service';

@Component({
	selector: 'app-counter',
	template: `
		<button (click)="counter.increment()">{{ counter.count() }}</button>
		<p>Double: {{ counter.double() }}</p>
	`,
})
export class Counter {
	counter = inject(CounterService);
}
```

By default the service is `providedIn: 'root'`, so there is one shared instance and you don't have to provide it anywhere.

## Inject dependencies

The factory runs in an injection context (the constructor of the generated class), so you can call `inject()` inside it:

```ts
export const TodosService = createInjectable(() => {
	const http = inject(HttpClient);
	const todos = signal<Todo[]>([]);

	return {
		todos: todos.asReadonly(),
		load: () =>
			http.get<Todo[]>('/api/todos').subscribe((data) => todos.set(data)),
	};
});
```

## Scoped services

Pass `{ providedIn: 'scoped' }` to create a service that is not provided in root. Add it to the `providers` of a component, route or `bootstrapApplication`, and each of those injectors gets its own instance.

```ts
export const FormStateService = createInjectable(
	() => {
		const dirty = signal(false);
		return { dirty };
	},
	{ providedIn: 'scoped' },
);

@Component({
	selector: 'app-edit-user',
	providers: [FormStateService],
	template: `
		...
	`,
})
export class EditUser {
	formState = inject(FormStateService);
}
```

## Named functions

You can pass a named function instead of an arrow function. The class name then includes it, which makes the service easier to recognise in Angular DevTools and error messages.

```ts
export const CounterService = createInjectable(function CounterService() {
	const count = signal(0);
	return { count: count.asReadonly() };
});

console.log(CounterService.name); // '_Injectable_CounterService'
```

## API

```ts
function createInjectable<TFactory extends (...args: any[]) => object>(
	factory: TFactory,
	options?: { providedIn?: 'root' | 'platform' | 'scoped' },
): Type<ReturnType<TFactory>>;
```

| Option       | Type                               | Default  | Description                                                                                                           |
| ------------ | ---------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `providedIn` | `'root' \| 'platform' \| 'scoped'` | `'root'` | `'root'`: one app-wide instance. `'platform'`: shared by all apps on the page. `'scoped'`: you add it to `providers`. |

The factory runs once per instance, when the service is first injected. Each property of the returned object is exposed on the service through a getter and setter, so reassigning a property on the service updates the object your factory returned.
