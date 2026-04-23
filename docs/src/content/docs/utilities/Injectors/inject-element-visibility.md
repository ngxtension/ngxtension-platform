---
title: injectElementVisibility
description: ngxtension/inject-element-visibility
entryPoint: ngxtension/inject-element-visibility
badge: stable
contributors: ['enea-jahollari']
---

Tracks the visibility of an element within the viewport using the IntersectionObserver API. This is useful for implementing features like lazy loading, infinite scrolling, or triggering animations when elements become visible.

```ts
import { injectElementVisibility } from 'ngxtension/inject-element-visibility';
```

## Usage

`injectElementVisibility` tracks whether an element is visible in the viewport and returns a signal that updates whenever the visibility state changes.

### Basic usage with ElementRef

When used inside a component, it automatically injects the host element:

```ts
import { Component, effect } from '@angular/core';
import { injectElementVisibility } from 'ngxtension/inject-element-visibility';

@Component({
	selector: 'app-lazy-image',
	standalone: true,
	template: `
		@if (isVisible()) {
			<img [src]="imageUrl" alt="Lazy loaded image" />
		} @else {
			<div class="placeholder">Loading...</div>
		}
	`,
})
export class LazyImageComponent {
	isVisible = injectElementVisibility();
	imageUrl = 'https://example.com/image.jpg';

	constructor() {
		effect(() => {
			console.log('Element is visible:', this.isVisible());
		});
	}
}
```

### Usage with a specific element

You can track visibility of a specific element by passing it as an option:

```ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { injectElementVisibility } from 'ngxtension/inject-element-visibility';

@Component({
	selector: 'app-scroll-tracker',
	standalone: true,
	template: `
		<div #target class="target-section">
			<h2>Track this section</h2>
			<p>Visibility: {{ isVisible() ? 'Visible' : 'Hidden' }}</p>
		</div>
	`,
})
export class ScrollTrackerComponent {
	targetElement = viewChild.required<ElementRef>('target');
	isVisible = injectElementVisibility({
		element: this.targetElement().nativeElement,
	});
}
```

### Advanced options

#### Using threshold

Track when specific percentages of the element are visible:

```ts
export class PartialVisibilityComponent {
	// Trigger when 50% of the element is visible
	isHalfVisible = injectElementVisibility({
		threshold: 0.5,
	});

	// Track multiple thresholds
	visibility = injectElementVisibility({
		threshold: [0, 0.25, 0.5, 0.75, 1],
	});
}
```

#### Using rootMargin

Add margin around the viewport for early triggering:

```ts
export class EarlyLoadComponent {
	// Start loading 200px before element enters viewport
	isVisible = injectElementVisibility({
		rootMargin: '200px',
	});
}
```

#### Using scrollTarget

Track visibility within a scrollable container:

```ts
export class ScrollContainerComponent {
	scrollContainer = viewChild.required<ElementRef>('container');
	targetElement = viewChild.required<ElementRef>('target');

	isVisible = injectElementVisibility({
		element: this.targetElement().nativeElement,
		scrollTarget: this.scrollContainer().nativeElement,
	});
}
```

#### Using once option

Stop tracking after the first visibility change:

```ts
export class OnceVisibleComponent {
	// Only track the first time the element becomes visible
	wasVisible = injectElementVisibility({
		once: true,
	});

	constructor() {
		effect(() => {
			if (this.wasVisible()) {
				console.log('Element became visible for the first time!');
				// Load data, start animation, etc.
			}
		});
	}
}
```

#### Initial value

Set an initial visibility state:

```ts
export class InitialVisibleComponent {
	isVisible = injectElementVisibility({
		initialValue: true, // Assume visible initially
	});
}
```

## API

```ts
function injectElementVisibility(
	options?: InjectElementVisibilityOptions,
): Signal<boolean>;
```

### Parameters

- `options` (optional): An object that can have the following properties:
  - `element`: The element to track. Can be an `Element` or `ElementRef`. If not provided, will use the component's host element.
  - `window`: A custom `Window` instance, useful for testing or iframe scenarios.
  - `injector`: An `Injector` instance for Angular's dependency injection.
  - `initialValue`: Initial visibility state. Defaults to `false`.
  - `scrollTarget`: The element to use as the viewport for checking visibility. Defaults to the browser viewport.
  - `rootMargin`: Margin around the root. Can have values similar to CSS margin property (e.g., "10px", "10px 20px"). Defaults to "0px".
  - `threshold`: A number or array of numbers between 0 and 1 indicating at what percentage of the target's visibility the observer's callback should be executed. Defaults to `0`.
  - `once`: If `true`, stops tracking after the element becomes visible for the first time. Defaults to `false`.

### Returns

A readonly `Signal<boolean>` that emits `true` when the element is visible in the viewport, and `false` when it's not.

## Use Cases

### Lazy Loading Images

```ts
@Component({
	selector: 'app-lazy-img',
	standalone: true,
	template: `
		@if (isVisible()) {
			<img [src]="src" [alt]="alt" />
		} @else {
			<div class="skeleton"></div>
		}
	`,
})
export class LazyImgComponent {
	isVisible = injectElementVisibility({ once: true });
	@Input() src!: string;
	@Input() alt!: string;
}
```

### Infinite Scrolling

```ts
@Component({
	selector: 'app-infinite-scroll',
	standalone: true,
	template: `
		<div class="items">
			@for (item of items(); track item.id) {
				<div class="item">{{ item.name }}</div>
			}
		</div>
		<div #loadMore class="load-more-trigger"></div>
	`,
})
export class InfiniteScrollComponent {
	items = signal<Item[]>([]);
	loadMoreTrigger = viewChild.required<ElementRef>('loadMore');
	isLoadMoreVisible = injectElementVisibility({
		element: this.loadMoreTrigger().nativeElement,
		rootMargin: '100px',
	});

	constructor() {
		effect(() => {
			if (this.isLoadMoreVisible()) {
				this.loadMore();
			}
		});
	}

	loadMore() {
		// Load more items
	}
}
```

### Track Section Visibility for Navigation

```ts
@Component({
	selector: 'app-sticky-nav',
	standalone: true,
	template: `
		<nav>
			<a [class.active]="section1Visible()">Section 1</a>
			<a [class.active]="section2Visible()">Section 2</a>
			<a [class.active]="section3Visible()">Section 3</a>
		</nav>

		<section #section1>Content 1</section>
		<section #section2>Content 2</section>
		<section #section3>Content 3</section>
	`,
})
export class StickyNavComponent {
	section1 = viewChild.required<ElementRef>('section1');
	section2 = viewChild.required<ElementRef>('section2');
	section3 = viewChild.required<ElementRef>('section3');

	section1Visible = injectElementVisibility({
		element: this.section1().nativeElement,
		threshold: 0.5,
	});
	section2Visible = injectElementVisibility({
		element: this.section2().nativeElement,
		threshold: 0.5,
	});
	section3Visible = injectElementVisibility({
		element: this.section3().nativeElement,
		threshold: 0.5,
	});
}
```

## Notes

- Requires IntersectionObserver API support in the browser
- Automatically cleans up the observer when the component is destroyed
- Returns a readonly signal for immutability
- If the element or window is not available, returns a signal with the initial value
