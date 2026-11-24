---
title: TrackById / TrackByProp
description: Angular directives that simplify using trackBy in *ngFor, eliminating the need for custom component methods.
entryPoint: ngxtension/trackby-id-prop
badge: stable
contributors: ['daniele-morosinotto']
---

`TrackById` and `TrackByProp` give `*ngFor` a `trackBy` function straight from the template, so you don't have to
write a `trackBy` method in every component. With tracking, Angular reuses the existing DOM nodes when the list is
replaced with new objects that have the same id, instead of re-creating every row.

:::tip[Using `@for`? You don't need these]
Angular's built-in `@for` block requires a `track` expression, so tracking by a property is already one line:
`@for (item of items; track item.id)`. These directives are only useful in templates that still use `*ngFor`.
:::

## Usage

Import `NgFor` and `TrackById`, then add `trackById` to the `*ngFor` expression. Every item needs an `id` property
(`string` or `number`).

```angular-ts
import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { TrackById } from 'ngxtension/trackby-id-prop';

@Component({
	selector: 'app-user-list',
	imports: [NgFor, TrackById],
	template: `
		<ul>
			<li *ngFor="let user of users; trackById">{{ user.name }}</li>
		</ul>
	`,
})
export class UserList {
	users = [
		{ id: 1, name: 'Ada' },
		{ id: 2, name: 'Grace' },
		{ id: 3, name: 'Linus' },
	];
}
```

## Track by another property

When the unique key isn't called `id`, use `TrackByProp` and pass the property name.

```angular-ts
import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { TrackByProp } from 'ngxtension/trackby-id-prop';

@Component({
	selector: 'app-country-list',
	imports: [NgFor, TrackByProp],
	template: `
		<p *ngFor="let country of countries; trackByProp: 'code'">
			{{ country.name }} ({{ country.code }})
		</p>
	`,
})
export class CountryList {
	countries = [
		{ code: 'AL', name: 'Albania' },
		{ code: 'IT', name: 'Italy' },
	];
}
```

To import both directives at once, use `TRACK_BY_DIRECTIVES`:

```ts
import { NgFor } from '@angular/common';
import { TRACK_BY_DIRECTIVES } from 'ngxtension/trackby-id-prop';

@Component({
	// …
	imports: [NgFor, TRACK_BY_DIRECTIVES],
})
```

## API

Both directives must sit on the same element as `NgFor` (`NgForOf`), which is why you import `NgFor` too.

| Directive     | Selector             | Template syntax                                  | Tracks by   |
| ------------- | -------------------- | ------------------------------------------------ | ----------- |
| `TrackById`   | `[ngForTrackById]`   | `*ngFor="let item of items; trackById"`          | `item.id`   |
| `TrackByProp` | `[ngForTrackByProp]` | `*ngFor="let item of items; trackByProp: 'key'"` | `item[key]` |

| Input              | Directive     | Type      | Description                               |
| ------------------ | ------------- | --------- | ----------------------------------------- |
| `ngForTrackByProp` | `TrackByProp` | `keyof T` | Required. The property to track items by. |

`TrackById` is typed for items with an `id: string | number` property, so strict template type checking flags lists
without one. Neither directive checks the items at runtime: if the property is missing, every item is tracked as
`undefined`.
