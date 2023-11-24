---
title: repeat
description: An Angular directive extending NgFor to allow iteration over a fixed number of iterations.
badge: stable
contributor: Chau Tran
---

## Import

```ts
import { Repeat } from 'ngxtension/repeat';
```

## Usage

### Basic

Use the `Repeat` directive as an extension of Angular's `NgFor` to iterate over a fixed number of iterations. The [`TrackByFunction`](https://angular.io/api/core/TrackByFunction) is automatically set to efficiently iterate.

```ts
import { Component } from '@angular/core';
import { Repeat } from 'ngxtension/repeat';

@Component({
	imports: [Repeat],
	template: `
		<ul>
			<li *ngFor="let i; repeat: 3">{{ i }}</li>
		</ul>
	`,
})
export class App {}
```

This will produce the following output:

```html
<!-- Output -->
<!-- <li>0</li> -->
<!-- <li>1</li> -->
<!-- <li>2</li> -->
```

## API

### Inputs

- `n: number` - A non-negative integer, specifying the number of iterations.

### Validation

- An error is thrown if the input is either negative or not an integer.
