---
title: injectActiveElement
description: Get an Observable of the element that has focus in the document, updated on every focus and blur.
entryPoint: ngxtension/active-element
badge: stable
contributors: ['nevzat-topçu']
sidebar:
  order: 10
---

`injectActiveElement` gives you an Observable of the element that currently has focus. Use it to highlight the focused
field, show contextual help or track focus for accessibility, without adding `focus` and `blur` listeners yourself.

## Usage

Call it in an injection context (a field initializer or the constructor) and turn it into a signal with `toSignal`.

```angular-ts
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectActiveElement } from 'ngxtension/active-element';

@Component({
	selector: 'app-sign-in',
	template: `
		<input name="email" placeholder="Email" />
		<input name="password" type="password" placeholder="Password" />

		<p>Focused field: {{ activeElement()?.getAttribute('name') ?? 'none' }}</p>
	`,
})
export class SignIn {
	readonly activeElement = toSignal(injectActiveElement(), {
		initialValue: null,
	});
}
```

You can also keep it as an Observable and read it with the `async` pipe.

## How it works

`injectActiveElement` listens to `focus` and `blur` on the document in the capture phase, so it sees focus changes on
every element even though those events don't bubble.

- On `focus`, it emits `document.activeElement`.
- On `blur`, it emits `null`. When focus moves from one element to another, you get `null` first and then the new
  element.
- It doesn't emit an initial value. It emits on the first focus or blur after you subscribe, which is why the example
  passes `initialValue: null` to `toSignal`.
- The stream is shared and replays the latest value to new subscribers. It completes when the component or service that
  called it is destroyed.

## Outside an injection context

Pass an `Injector` when you call it later, for example in `ngOnInit`.

```ts
import { Component, inject, Injector, type OnInit } from '@angular/core';
import { injectActiveElement } from 'ngxtension/active-element';

@Component({ selector: 'app-example', template: '' })
export class Example implements OnInit {
	private readonly injector = inject(Injector);

	ngOnInit() {
		injectActiveElement(this.injector).subscribe((element) => {
			console.log('Focused element', element);
		});
	}
}
```

## API

```ts
function injectActiveElement(injector?: Injector): Observable<Element | null>;
```

| Parameter  | Type       | Default | Description                                                    |
| ---------- | ---------- | ------- | -------------------------------------------------------------- |
| `injector` | `Injector` | -       | Injector to use when you call it outside an injection context. |

Returns an `Observable<Element | null>` of the focused element, or `null` after a blur.
