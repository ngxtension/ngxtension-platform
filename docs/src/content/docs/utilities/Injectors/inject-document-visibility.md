---
title: injectDocumentVisibility
description: ngxtension/inject-document-visibility
entryPoint: inject-document-visibility
badge: stable
contributor: fiorelozere
---

`injectDocumentVisibility` is a utility function that provides a reactive signal reflecting the current visibility state of the document. This function is particularly useful for scenarios such as tracking user presence on a webpage (e.g., for analytics or pausing/resuming activities) and can be adapted for use with iframes or in testing environments.

```ts
import { injectDocumentVisibility } from 'ngxtension/inject-document-visibility';
```

## Usage

`injectDocumentVisibility` accepts an optional parameter `options` which can include a custom `document` and an `Injector` instance. The `document` parameter is particularly useful for testing scenarios or when needing to track the visibility of an iframe. The `injector` allows for dependency injection, providing more flexibility and facilitating testable code by decoupling from the global state or context.

```ts
const visibilityState = injectDocumentVisibility();

effect(() => {
	console.log(visibilityState.value);
});
```

## API

```ts
function injectDocumentVisibility(
	options?: InjectDocumentVisibilityOptions,
): Signal<DocumentVisibilityState>;
```

### Parameters

- `options` (optional): An object that can have the following properties:
  - `document`: A custom `Document` instance, defaulting to the global `document` object.
  - `injector`: An `Injector` instance for Angular's dependency injection.

### Returns

- `Signal<DocumentVisibilityState>`: A reactive signal that emits the current `DocumentVisibilityState` (e.g., `"visible"`, `"hidden"`) and updates when the document visibility state changes.
