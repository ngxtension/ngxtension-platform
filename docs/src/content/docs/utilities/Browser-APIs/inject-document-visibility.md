---
title: injectDocumentVisibility
description: A signal of the document's visibility state ('visible' or 'hidden') that updates when the user switches tabs or minimizes the window.
entryPoint: ngxtension/inject-document-visibility
badge: stable
contributors: ['fiorelozere']
---

`injectDocumentVisibility` gives you a signal that is `'visible'` while the user is looking at your page and `'hidden'`
when they switch tabs, minimize the window or lock the screen. Use it to pause polling, videos or animations in
background tabs, or to track presence for analytics.

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { injectDocumentVisibility } from 'ngxtension/inject-document-visibility';

@Component({
	selector: 'app-live-feed',
	template: `
		<p>Tab is {{ visibility() }}</p>
	`,
})
export class LiveFeed {
	readonly visibility = injectDocumentVisibility();

	constructor() {
		effect(() => {
			if (this.visibility() === 'hidden') {
				console.log('Paused while the tab is in the background');
			} else {
				console.log('Resumed');
			}
		});
	}
}
```

The signal has the current state right away and updates on every `visibilitychange` event. The listener is removed
when the component is destroyed.

## Observe another document

Pass `document` to track a different document, for example an iframe's `contentDocument`, or a fake document in tests.

```ts
const iframeVisibility = injectDocumentVisibility({
	document: iframe.contentDocument!,
});
```

## As an Observable

`injectDocumentVisibilityStream` returns the same data as an `Observable<DocumentVisibilityState>`. It emits the
current state on subscribe and then on every change. Use it when you're composing RxJS streams.

```ts
import { injectDocumentVisibilityStream } from 'ngxtension/inject-document-visibility';

const visibility$ = injectDocumentVisibilityStream();
```

:::caution[Call it in an injection context]
`injectDocumentVisibility` accepts an `injector` option, but it uses `toSignal` internally without forwarding that
injector, so calling it outside an injection context still throws. Call it in a constructor or field initializer. If
you need it elsewhere, use `injectDocumentVisibilityStream({ injector })`, which does work outside an injection
context. You then manage the subscription yourself.
:::

## API

```ts
function injectDocumentVisibility(
	options?: InjectDocumentVisibilityOptions,
): Signal<DocumentVisibilityState>;

function injectDocumentVisibilityStream(
	options?: InjectDocumentVisibilityOptions,
): Observable<DocumentVisibilityState>;
```

| Option     | Type       | Default                 | Description                                                  |
| ---------- | ---------- | ----------------------- | ------------------------------------------------------------ |
| `document` | `Document` | the injected `DOCUMENT` | The document to observe, for example an iframe's document.   |
| `injector` | `Injector` | -                       | Injector used to resolve `DOCUMENT` (see the caution above). |

Returns a `Signal<DocumentVisibilityState>`: `'visible'` or `'hidden'`.

## Related

- [whenDocumentVisible](/utilities/rxjs-operators/when-document-visible/) pauses an RxJS stream while the tab is
  hidden.
