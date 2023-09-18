---
title: CallPipe / ApplyPipe
description: ngxtension/call-apply
---

`callPipe` and `applyPipe` are simple standalone pipes that simplify the calling of PURE functions passing params to it; they take advantage of the "memoization" offered by pure pipes in Angular, and ensure that you use them only with PURE functions (aka if you use this inside the body function they throw errors!)

```ts
import { CallPipe, ApplyPipe } from 'ngxtension/call-apply';
```

## Usage

Both `CallPipe` and `ApplyPipe` need a PURE function or method to invoke (aka you can't use `this` in the function body), the difference between the two is only in that invocation order and that `|call` is suitable only for function with 1-param, instead `|apply` works for function with any number of params.

```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CallPipe, ApplyPipe } from 'ngxtension/call-apply';

@Component({
	selector: 'my-app',
	standalone: true,
	imports: [CallPipe, ApplyPipe],
	template: `
		<button (click)="updateClock()">UPDATE CLOCK</button>

		<b>call UTC: {{ now | call : ISOFormat }}</b>
		<i>with apply: {{ ISOFormat | apply : now }}</i>
		<p>{{ join | apply : 'Hello' : 'world' : '!' }}</p>

		<!-- IF YOU UNCOMMENT NEXT LINE IT WILL THROW ERROR 
		<h1>THIS IS NOT PURE: {{ updateClock | apply }}</h1>
		-->
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	public now = new Date(42, 42, 42, 42, 42, 42, 42); //"1945-08-12T16:42:42.042Z"
	public ISOFormat = (date: Date) => date.toISOString();
	public join(...rest: string[]) {
		return rest.join(' ');
	}
	public updateClock() {
		this.now = new Date();
		return this.now;
	}
}
```
