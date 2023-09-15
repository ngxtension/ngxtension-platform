---
title: call apply Pipes
description: ngxtension/call-apply
---

`callPipe` and `applyPipe` are simple standalone pipes that simplify the calling of a PURE functions passing params to it, they take advantage of the "memoization" offerd by pure pipes in Angular, and enforces that you use them only with PURE functions (aka if you use this inside the body function they throws error!)

```ts
import { CallPipe, ApplyPipe } from 'ngxtension/if-validation';
```

## Usage

Both `CallPipe` and `ApplyPipe` need a PURE function or method to invoke (aka you can't use `this` in the function body), the difference between the two is only in that invocation order and that `|call` is sutable only for funciton with 1-param, instead `|apply` works for function with any number of params.

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
		<p>{{ join | apply : 'Hello' : ' world' : '!' }}</p>

		<!-- PARAMS ARE NOT STRICT TYPED SORRY :-( ANY IDEA? -->
		<div>{{ join | apply : 41 : 1 }}</div>
		<!-- PRINT: 42 -->

		<!-- IF YOU UNCOMMENT NEXT LINE IT WILL THROW ERROR 
		<h1>THIS IS NOT PURE: {{ updateClock | apply }}</h1>
		-->
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	public now = new Date(42, 42, 42, 42, 42, 42, 42); //"1945-08-12T16:42:42.042Z"
	public ISOFormat = (date: Date) => date.toISOString();
	public join(first: string, ...rest: string[]) {
		return rest.reduce((a, b) => a + b, first);
	}
	public updateClock() {
		this.now = new Date();
		return this.now;
	}
}
```
