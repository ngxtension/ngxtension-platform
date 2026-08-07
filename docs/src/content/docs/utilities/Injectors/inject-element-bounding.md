---
title: injectElementBounding
description: ngxtension/inject-element-bounding
entryPoint: ngxtension/inject-element-bounding
badge: stable
contributors: ['enea-jahollari']
---

Reactive bounding box of an HTML element. This utility tracks the position and dimensions of an element, automatically updating when the element is resized, moved, or when the window is scrolled or resized.

```ts
import { injectElementBounding } from 'ngxtension/inject-element-bounding';
```

## Usage

`injectElementBounding` accepts a signal that returns an `ElementRef` or `HTMLElement`, and optional configuration options. It returns an object containing reactive signals for all bounding box properties.

```ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { injectElementBounding } from 'ngxtension/inject-element-bounding';

@Component({
	selector: 'app-example',
	standalone: true,
	template: `
		<div #target class="box">Resize or scroll to see bounding box updates</div>
		<div class="info">
			<p>Width: {{ bounding.width() }}px</p>
			<p>Height: {{ bounding.height() }}px</p>
			<p>Top: {{ bounding.top() }}px</p>
			<p>Left: {{ bounding.left() }}px</p>
			<p>Right: {{ bounding.right() }}px</p>
			<p>Bottom: {{ bounding.bottom() }}px</p>
		</div>
	`,
})
export class ExampleComponent {
	target = viewChild<ElementRef<HTMLDivElement>>('target');
	bounding = injectElementBounding(this.target);
}
```

### With Options

```ts
@Component({
	selector: 'app-example',
	standalone: true,
	template: `
		<div #target>Content</div>
	`,
})
export class ExampleComponent {
	target = viewChild<ElementRef<HTMLDivElement>>('target');

	bounding = injectElementBounding(this.target, {
		reset: true, // Reset to 0 when element is removed
		windowResize: true, // Listen to window resize events
		windowScroll: true, // Listen to window scroll events
		immediate: true, // Calculate immediately on mount
		updateTiming: 'sync', // Update synchronously or on next frame
	});

	constructor() {
		effect(() => {
			console.log('Element width:', this.bounding.width());
			console.log('Element position:', {
				x: this.bounding.x(),
				y: this.bounding.y(),
			});
		});
	}
}
```

### With Raw HTMLElement

You can also use raw `HTMLElement` instead of `ElementRef`:

```ts
@Component({
	selector: 'app-example',
	standalone: true,
	template: `
		<div #target>Content</div>
	`,
})
export class ExampleComponent {
	target = viewChild<ElementRef<HTMLDivElement>>('target');
	elementSignal = signal<HTMLElement | null>(null);

	bounding = injectElementBounding(this.elementSignal);

	ngAfterViewInit() {
		const el = this.target()?.nativeElement;
		if (el) {
			this.elementSignal.set(el);
		}
	}
}
```

### Manual Updates

The returned object includes an `update()` function for manual recalculation:

```ts
@Component({
	selector: 'app-example',
	standalone: true,
	template: `
		<div #target>Content</div>
		<button (click)="refresh()">Refresh Bounding Box</button>
	`,
})
export class ExampleComponent {
	target = viewChild<ElementRef<HTMLDivElement>>('target');
	bounding = injectElementBounding(this.target);

	refresh() {
		this.bounding.update();
	}
}
```

## API

```ts
function injectElementBounding(
	target: Signal<ElementRef<HTMLElement> | HTMLElement | null | undefined>,
	options?: InjectElementBoundingOptions,
): InjectElementBoundingReturn;
```

### Parameters

- `target`: A signal that returns an `ElementRef`, `HTMLElement`, or `null/undefined`
- `options` (optional): Configuration object with the following properties:
  - `injector`: An `Injector` instance for dependency injection
  - `reset`: Reset values to 0 when element is removed (default: `true`)
  - `windowResize`: Listen to window resize events (default: `true`)
  - `windowScroll`: Listen to window scroll events (default: `true`)
  - `immediate`: Calculate bounding box immediately on mount (default: `true`)
  - `updateTiming`: When to recalculate - `'sync'` for immediate or `'next-frame'` for next animation frame (default: `'sync'`)

### Returns

An object with the following readonly signal properties:

- `height`: Signal containing the element's height in pixels
- `width`: Signal containing the element's width in pixels
- `top`: Signal containing the distance from the element's top edge to the viewport top
- `left`: Signal containing the distance from the element's left edge to the viewport left
- `right`: Signal containing the distance from the element's right edge to the viewport left
- `bottom`: Signal containing the distance from the element's bottom edge to the viewport top
- `x`: Signal containing the element's x coordinate (same as `left`)
- `y`: Signal containing the element's y coordinate (same as `top`)
- `update`: Function to manually trigger a recalculation of the bounding box

## How it Works

`injectElementBounding` uses several browser APIs to track element bounds:

1. **ResizeObserver**: Detects when the element's size changes
2. **MutationObserver**: Watches for changes to the element's `style` and `class` attributes
3. **Window Events**: Optionally listens to `scroll` and `resize` events on the window
4. **getBoundingClientRect()**: Calculates the actual bounding box values

All observers and event listeners are automatically cleaned up when the component is destroyed.

## Use Cases

- Creating tooltips or popovers that need to position relative to an element
- Implementing sticky headers or scroll-triggered animations
- Building responsive components that react to their own size changes
- Tracking element visibility and position for analytics
- Creating drag-and-drop interfaces with accurate collision detection
