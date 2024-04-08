---
title: RepeatPipe
description: Standalone Angular pipe for easily repeating for loops in the template
entryPoint: repeat-pipe
badge: stable
contributors: ['dafnik']
---

## Import

```ts
import { RepeatPipe } from 'ngxtension/repeat-pipe';
```

## Usage

### Basic

Use the `repeat` pipe as an easy way to loop over a number of iterations.

```ts
import { Component } from '@angular/core';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

@Component({
	imports: [RepeatPipe],
	template: `
		<ul>
			@for (i of 3 | repeat; track i) {
				<li>{{ i }}</li>
			}
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

### Change start point

You can specify a `startAt` value as the second argument passed into the pipe.

```ts
import { Component } from '@angular/core';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

@Component({
	imports: [RepeatPipe],
	template: `
		<ul>
			@for (i of 3 | repeat: 10; track i) {
				<li>{{ i }}</li>
			}
		</ul>
	`,
})
export class App {}
```

This will produce the following output:

```html
<!-- Output -->
<!-- <li>10</li> -->
<!-- <li>11</li> -->
<!-- <li>12</li> -->
```

## API

### Inputs

- `length: number` - A non-negative integer, specifying the number of iterations.
- `startAt: number` - A integer, specifying the start point of iterations.

### Validation

- An error is thrown if `length` is either negative or not an integer.
- An error is thrown if `startAt` is not an integer.
