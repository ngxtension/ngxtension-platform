---
title: injectTextSelection
description: Signals for the user's current text selection (text, ranges and their on-screen rectangles), updated on every selectionchange.
entryPoint: ngxtension/inject-text-selection
contributors: ['fiorelozere']
---

`injectTextSelection` tracks what the user has selected on the page and exposes it as signals: the selected text, the
selection ranges and their bounding rectangles. Use it to build "quote", "share" or "highlight" actions that appear
next to the selection.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { injectTextSelection } from 'ngxtension/inject-text-selection';

@Component({
	selector: 'app-article',
	template: `
		<article>
			<p>Select any part of this paragraph to quote it.</p>
		</article>

		@if (selection.text()) {
			<p>Selected: "{{ selection.text() }}"</p>
			<button type="button" (click)="selection.clearSelection()">Clear</button>
		}
	`,
})
export class Article {
	readonly selection = injectTextSelection();
}
```

Call it in an injection context (a field initializer or the constructor). It has no `injector` option.

## Position a toolbar next to the selection

`rects()` returns the bounding rectangle of each selected range, in viewport coordinates. Use the first one to place a
floating toolbar.

```angular-ts
import { Component, computed } from '@angular/core';
import { injectTextSelection } from 'ngxtension/inject-text-selection';

@Component({
	selector: 'app-quote-toolbar',
	template: `
		@if (position(); as pos) {
			<div class="toolbar" style="position: fixed" [style.top.px]="pos.top" [style.left.px]="pos.left">
				<button type="button">Quote</button>
			</div>
		}
	`,
})
export class QuoteToolbar {
	private readonly selection = injectTextSelection();

	readonly position = computed(() => {
		const [rect] = this.selection.rects();
		if (!rect || !this.selection.text()) return null;
		return { top: rect.top - 40, left: rect.left };
	});
}
```

## How it works

- A single `selectionchange` listener on the document is shared by every caller. It is attached while at least one
  caller is alive and removed after the last one is destroyed.
- `text`, `ranges` and `rects` are computed from the current `Selection`, so they update together.

## API

```ts
function injectTextSelection(): {
	text: Signal<string | undefined>;
	ranges: Signal<Range[]>;
	rects: Signal<DOMRect[]>;
	selection: Signal<Selection | null>;
	clearSelection: () => void;
};
```

| Property         | Type                          | Description                                                                                                                                  |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`           | `Signal<string \| undefined>` | The selected text, or `''` when nothing is selected.                                                                                         |
| `ranges`         | `Signal<Range[]>`             | The [`Range`](https://developer.mozilla.org/en-US/docs/Web/API/Range) objects of the current selection.                                      |
| `rects`          | `Signal<DOMRect[]>`           | The bounding client rectangle of each range.                                                                                                 |
| `selection`      | `Signal<Selection \| null>`   | The current [`Selection`](https://developer.mozilla.org/en-US/docs/Web/API/Selection), read-only. `null` before the first `selectionchange`. |
| `clearSelection` | `() => void`                  | Clears the selection (calls `window.getSelection().empty()`).                                                                                |
