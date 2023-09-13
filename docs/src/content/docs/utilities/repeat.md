---
title: repeat
description: ngxtension/repeat
---

`repeat` or `Repeat` is an extension of [`NgFor`](https://angular.io/api/core/ng-for) directive to allow consumers to iterate "x times" instead of iterate over a list of items

```ts
import { Repeat } from 'ngxtension/repeat';
```

## Usage

`Repeat` accepts a non-negative integer as an `Input`.

```ts
@Component({
	imports: [Repeat],
	template: `
		<ul>
			<li *ngFor="let i; repeat: 3">{{ i }}</li>
			<!-- <li>0</li> -->
			<!-- <li>1</li> -->
			<!-- <li>2</li> -->
		</ul>
	`,
})
export class App {}
```
