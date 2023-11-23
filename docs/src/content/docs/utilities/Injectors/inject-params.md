---
title: injectParams
description: ngxtension/inject-params
badge: stable
contributor: Enea Jahollari
---

`injectParams` is a helper function that allows us to inject params from the current route as a signal.

Having params as a signal helps in a modern angular signals based architecture.

```ts
import { injectParams } from 'ngxtension/inject-params';
```

## Usage

`injectParams` when is called, returns a signal with the current route params.

```ts
@Component({
	standalone: true,
	template: '<div>{{params() | json}}</div>',
})
class TestComponent {
	params = injectParams();
}
```

If we want to get the value for a specific param, we can pass the name of the param to `injectParams`.

```ts
@Component({
	template: `
		@if (user()) {
		<div>{{ user.name }}</div>
		} @else {
		<div>No user!</div>
		}
	`,
})
class TestComponent {
	userId = injectParams('id'); // returns a signal with the value of the id param

	user = computedFrom(
		[this.userId],
		switchMap((id) => this.userService.getUser(id).pipe(startWith(null)))
	);
}
```

Or, if we want to transform the params, we can pass a function to `injectParams`.

```ts
@Component()
class TestComponent {
	paramsKeys = injectParams((params) => Object.keys(params)); // returns a signal with the keys of the params
}
```
