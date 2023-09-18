---
title: TrackById / TrackByProp
description: ngxtension/trackby-id-prop
---

`trackById` and `trackByProp` are simple standalone directives that helps to implement the trackBy in \*ngFor without need to write a custom method inside your component.

```ts
import { TRACK_BY_DIRECTIVES } from 'ngxtension/trackby-id-prop';
//OR SIMPLY IMPORT AND USE ONE OF THIS
import { TrackById, TrackByProp } from 'ngxtension/trackby-id-prop';
```

## Usage

If the items that you iterate with ngFor has an `id` prop (**case-sentitive**!) than you can simple use `trackById` otherwise you can specify the field to be used to track your items using the other directive: `trackByProp:'PROP_NAME'`

```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TRACK_BY_DIRECTIVES } from 'ngxtension/trackby-id-prop';

@Component({
	selector: 'my-app',
	standalone: true,
	imports: [TRACK_BY_DIRECTIVES, CommonModule],
	template: `
		<!--                          👇 -->
		<ul *ngFor="let item of arr; trackById">
			<li>{{ item.name }}</li>
		</ul>
		<p *ngFor="let item of arr; trackByProp: 'name'">// 👈 {{ item.name }} @{{ item.id }}</p>

		<!--                          👇 -->
		<div *ngFor="let item of arr; trackByProp: 'other'">
			<!-- THIS WILL FAIL AND ERROR IF PROP 'other' DOESN'T EXIST IN arr ITEMS -->
			{{ item | json }}
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	public arr = [
		{ id: 1, name: 'foo' /* other: 'A1' */ },
		{ id: 2, name: 'bar' /* other: 'B2' */ },
		{ id: 3, name: 'baz' /* other: 'C3' */ },
	];
}
```
