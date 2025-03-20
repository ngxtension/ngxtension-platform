---
title: injectTextSelection
description: ngxtension/inject-text-selection
entryPoint: ngxtension/inject-text-selection
contributors: ['fiorelozere']
---

`injectTextSelection` is a helper function to **reactively track user text selection**. It listens for the browser's `selectionchange` event and updates reactive signals for the current selection, selected text, the selection ranges, and their bounding client rectangles.

## Features

- **Reactive selection tracking:** Automatically updates when the user changes their text selection.
- **Automatic cleanup**: Use Angular's DestroyRef to remove the listener when the hosting component/service is destroyed..

## Usage

### Import and Use in a Component

Below is an example of how to integrate the text selection in an Angular component:

```ts
import { injectTextSelection } from 'ngxtension/inject-text-selection';

@Component({
  template: `
    <div>
      <p>Selected text: {{ selectionState.text() }}</p>
    </div>
``,
})
export class TextSelectionDemoComponent {
  readonly selectionState = injectTextSelection();

  constructor() {
    effect(() => {
      console.log(this.selectionState.text());
      console.log(this.selectionState.rects());
      console.log(this.selectionState.ranges());
      console.log(this.selectionState.selection());
    });
  }
}
```

### API

Creates reactive signals for text selection.

- **Returns: An object with the following properties:**
  - `text`: A **computed** signal returning the selected text as a string.
  - `ranges`: A **computed** signal returning an array of [Range](https://developer.mozilla.org/en-US/docs/Web/API/Range) objects corresponding to the current selection.
  - `rects`: A **computed** signal that maps each Range to its bounding client rect.
  - `selection`: A writable signal representing the current [Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection) object (or `null` if no selection exists).
  - `clearSelection`: A convenience method for `window.getSelection().empty()` to clear the selection.
