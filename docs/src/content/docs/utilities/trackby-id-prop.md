---
title: TrackById / TrackByProp
description: Angular directives that simplify using trackBy in *ngFor, eliminating the need for custom component methods.
---

## Import

```ts
import { TrackById, TrackByProp } from 'ngxtension/trackby-id-prop';
```

## Usage

### TrackById

For objects that have an `id` property, use `TrackById` to efficiently iterate through them in `*ngFor`.

```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TrackById } from 'ngxtension/trackby-id-prop';

@Component({
	selector: 'my-app',
	imports: [TrackById],
	template: `
		<ul *ngFor="let item of arr; trackById">
			<li>{{ item.name }}</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	public arr = [
		{ id: 1, name: 'foo' },
		{ id: 2, name: 'bar' },
		{ id: 3, name: 'baz' },
	];
}
```

### TrackByProp

If you need to specify a different property for tracking, use `TrackByProp`.

```ts
template: `
	<p *ngFor="let item of arr; trackByProp: 'name'">
		{{ item.name }} @{{ item.id }}
	</p>
`;
```

## API

### Inputs for TrackById

- `ngForOf: NgIterable<T>` - An iterable containing objects with an `id` property.

### Inputs for TrackByProp

- `ngForOf: NgIterable<T>` - An iterable of objects.
- `ngForTrackByProp: keyof T` - The property name for tracking objects (required).

### Validation

- For `TrackById`, an error is thrown if the iterable's objects don't have an `id` property.
- For `TrackByProp`, an error is thrown if the specified property doesn't exist on the iterable's objects.
