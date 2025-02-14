---
title: injectParams
description: ngxtension/inject-params
entryPoint: ngxtension/inject-params
badge: stable
contributors: ['enea-jahollari']
---

`injectParams` is a helper function that allows us to inject params from the current route as a signal.

Having params as a signal helps in a modern angular signals based architecture.

```ts
import { injectParams } from 'ngxtension/inject-params';
```

## Usage

### Get all route params

`injectParams` returns a signal with the current route params.

```ts
@Component({
	standalone: true,
	template: '<div>{{params() | json}}</div>',
})
class TestComponent {
	params = injectParams();
}
```

#### Transform all params

Or, if we want to transform the params, we can pass a function to `injectParams`.

```ts
@Component()
class TestComponent {
	paramsKeys = injectParams((params) => Object.keys(params)); // returns a signal with the keys of the params
}
```

### Specific param

If we want to get the value for a specific param, we can pass the name of the param to `injectParams`.

```ts
@Component({
	template: `
		@if (user(); as user) {
			<div>{{ user.name }}</div>
		} @else {
			<div>No user!</div>
		}
	`,
})
class TestComponent {
	userId = injectParams('id'); // returns a signal with the value of the id param

	user = derivedFrom(
		[this.userId],
		switchMap((id) => this.userService.getUser(id).pipe(startWith(null))),
	);
}
```

#### Transform

If you want to additional parse the specific param, we can pass a `parse` function.

```ts
@Component({
	template: `
		@if (user(); as user) {
			<div>{{ user.name }}</div>
		} @else {
			<div>No user!</div>
		}
	`,
})
class TestComponent {
	userId = injectParams('id', { parse: numberAttribute }); // returns a signal with the value of the id param parsed to a number

	user = derivedFrom(
		[this.userId],
		switchMap((id) => this.userService.getUser(id).pipe(startWith(null))),
	);
}
```

#### Default value

If we want to use a default value if there is no value, we can pass a `defaultValue`.

```ts
@Component({
	template: `
		@if (angular(); as angular) {
			<div>{{ angular.name }}</div>
		} @else {
			<div>No Angular version found!</div>
		}
	`,
})
class TestComponent {
	angularVersion = injectParams('version', { defaultValue: '19' }); // returns a signal with the value of the id param parsed to a number

	angular = derivedFrom(
		[this.angularVersion],
		switchMap((version) =>
			this.angularService.getAngular(version).pipe(startWith(null)),
		),
	);
}
```
