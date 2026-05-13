---
title: injectElementSize
description: ngxtension/inject-element-size
entryPoint: ngxtension/inject-element-size
badge: stable
contributors: ['enea-jahollari']
---

Reactive size of an HTML element using ResizeObserver. This injector automatically tracks the width and height of an element and updates signals whenever the element is resized.

```ts
import { injectElementSize } from 'ngxtension/inject-element-size';
```

## Usage

`injectElementSize` accepts a target element reference (either an `ElementRef` or a `Signal<ElementRef>`) and optional configuration options. It returns an object containing readonly signals for `width` and `height` that automatically update when the element size changes.

### Basic Example

```ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { injectElementSize } from 'ngxtension/inject-element-size';

@Component({
	selector: 'app-element-size',
	standalone: true,
	template: `
		<div
			#resizableElement
			style="resize: both; overflow: auto; width: 200px; height: 150px; border: 1px solid;"
		>
			Resize me!
		</div>
		<p>Width: {{ size.width() }}px</p>
		<p>Height: {{ size.height() }}px</p>
	`,
})
export class ElementSizeComponent {
	resizableElement = viewChild<ElementRef>('resizableElement');
	size = injectElementSize(this.resizableElement);
}
```

### With Initial Size

You can provide an initial size that will be used before the ResizeObserver initializes:

```ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { injectElementSize } from 'ngxtension/inject-element-size';

@Component({
	selector: 'app-element-size',
	template: `
		<div #myElement>Content</div>
		<p>Width: {{ size.width() }}px</p>
		<p>Height: {{ size.height() }}px</p>
	`,
})
export class ElementSizeComponent {
	myElement = viewChild<ElementRef>('myElement');
	size = injectElementSize(this.myElement, {
		initialSize: { width: 100, height: 100 },
	});
}
```

### Different Box Models

The `box` option allows you to specify which box model to use for measurements:

```ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { injectElementSize } from 'ngxtension/inject-element-size';

@Component({
	selector: 'app-element-size',
	standalone: true,
	template: `
		<div #myElement style="padding: 20px; border: 5px solid;">Content</div>
		<div>
			<p>Content Box - Width: {{ contentBoxSize.width() }}px</p>
			<p>Border Box - Width: {{ borderBoxSize.width() }}px</p>
		</div>
	`,
})
export class ElementSizeComponent {
	myElement = viewChild<ElementRef>('myElement');

	// Only measures the content area
	contentBoxSize = injectElementSize(this.myElement, {
		box: 'content-box',
	});

	// Includes padding and border
	borderBoxSize = injectElementSize(this.myElement, {
		box: 'border-box',
	});
}
```

### Using with Dynamic Elements

When working with elements that may not be immediately available, you can pass a signal:

```ts
import { Component, ElementRef, signal } from '@angular/core';
import { injectElementSize } from 'ngxtension/inject-element-size';

@Component({
	selector: 'app-dynamic-element',
	standalone: true,
	template: `
		@if (showElement()) {
			<div #dynamicElement>Dynamic Content</div>
		}
		<button (click)="toggleElement()">Toggle Element</button>
		<p>Width: {{ size.width() }}px</p>
		<p>Height: {{ size.height() }}px</p>
	`,
})
export class DynamicElementComponent {
	showElement = signal(false);
	elementRef = signal<ElementRef | undefined>(undefined);

	size = injectElementSize(this.elementRef, {
		initialSize: { width: 0, height: 0 },
	});

	toggleElement() {
		this.showElement.update((v) => !v);
	}
}
```

### SVG Elements

The injector properly handles SVG elements by using `getBoundingClientRect()`:

```ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { injectElementSize } from 'ngxtension/inject-element-size';

@Component({
	selector: 'app-svg-size',
	standalone: true,
	template: `
		<svg #svgElement width="200" height="100">
			<rect width="100%" height="100%" fill="blue" />
		</svg>
		<p>SVG Width: {{ size.width() }}px</p>
		<p>SVG Height: {{ size.height() }}px</p>
	`,
})
export class SVGSizeComponent {
	svgElement = viewChild<ElementRef>('svgElement');
	size = injectElementSize(this.svgElement);
}
```

## API

```ts
function injectElementSize(
	target: ElementRef<HTMLElement> | Signal<ElementRef<HTMLElement> | undefined>,
	options?: InjectElementSizeOptions,
): Readonly<ElementSizeState>;
```

### Parameters

- `target`: The target element to observe. Can be:

  - `ElementRef<HTMLElement>`: A static element reference
  - `Signal<ElementRef<HTMLElement> | undefined>`: A signal containing an element reference (useful for dynamic elements)

- `options` (optional): An object that can have the following properties:
  - `initialSize`: The initial size of the element (default: `{ width: 0, height: 0 }`)
  - `box`: The box model to use for ResizeObserver (default: `'content-box'`)
    - `'content-box'`: Only the content area
    - `'border-box'`: Content + padding + border
    - `'device-pixel-content-box'`: Content in device pixels
  - `window`: A custom `Window` instance, defaulting to the global `window` object
  - `injector`: An `Injector` instance for Angular's dependency injection

### Returns

A readonly object with the following properties:

- `width`: A readonly signal that emits the current width of the element in pixels
- `height`: A readonly signal that emits the current height of the element in pixels

## Notes

- The injector uses the native `ResizeObserver` API, which is supported in all modern browsers
- The signals are readonly to prevent external modifications
- The ResizeObserver is automatically cleaned up when the component is destroyed
- For SVG elements, the injector uses `getBoundingClientRect()` to get accurate dimensions
- When the target element is not available (undefined), the signals will use the `initialSize` values
