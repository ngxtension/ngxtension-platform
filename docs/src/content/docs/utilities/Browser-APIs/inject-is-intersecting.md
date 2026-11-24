---
title: injectIsIntersecting
description: An Observable of IntersectionObserver entries for a component's host element or any element, to know when it enters or leaves the viewport.
entryPoint: ngxtension/inject-is-intersecting
badge: stable
contributors: ['enea-jahollari']
---

`injectIsIntersecting` tells you when an element enters or leaves the viewport. Use it to lazy-load data or images,
start animations when a section scrolls into view, or track impressions. It returns an Observable of
`IntersectionObserverEntry`, for the host element of the current component or directive by default.

One shared `IntersectionObserver` is created outside the Angular zone for the whole app; entries are emitted inside the
zone.

## Usage

Call it in an injection context to observe the host element. Each entry has `isIntersecting`, which is `true` while
the element is in view.

```angular-ts
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectIsIntersecting } from 'ngxtension/inject-is-intersecting';
import { map } from 'rxjs';

@Component({
	selector: 'app-hero-video',
	template: `
		@if (inView()) {
			<video src="/hero.mp4" autoplay muted loop></video>
		}
	`,
})
export class HeroVideo {
	readonly inView = toSignal(
		injectIsIntersecting().pipe(map((entry) => entry.isIntersecting)),
		{ initialValue: false },
	);
}
```

## Load data the first time it's visible

Take the first entry where the element is visible, then fetch. The request runs once, only if the user scrolls to it.

```angular-ts
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectIsIntersecting } from 'ngxtension/inject-is-intersecting';
import { filter, switchMap, take } from 'rxjs';
import { CommentsService } from './comments.service';

@Component({
	selector: 'app-comments',
	template: `
		@for (comment of comments(); track comment.id) {
			<p>{{ comment.text }}</p>
		}
	`,
})
export class Comments {
	private readonly commentsService = inject(CommentsService);

	readonly comments = toSignal(
		injectIsIntersecting().pipe(
			filter((entry) => entry.isIntersecting),
			take(1),
			switchMap(() => this.commentsService.load()),
		),
		{ initialValue: [] },
	);
}
```

## Observe a child element

Pass `element` to observe something other than the host. A child element is available only after the view renders,
so call `injectIsIntersecting` in `afterNextRender` and pass the `injector`.

```angular-ts
import {
	afterNextRender,
	Component,
	ElementRef,
	inject,
	Injector,
	signal,
	viewChild,
} from '@angular/core';
import { injectIsIntersecting } from 'ngxtension/inject-is-intersecting';

@Component({
	selector: 'app-article',
	template: `
		<article>…</article>
		<footer #footer [class.seen]="footerSeen()">The end</footer>
	`,
})
export class Article {
	private readonly footer = viewChild.required<ElementRef<HTMLElement>>('footer');
	private readonly injector = inject(Injector);

	readonly footerSeen = signal(false);

	constructor() {
		afterNextRender(() => {
			injectIsIntersecting({
				element: this.footer().nativeElement,
				injector: this.injector,
			}).subscribe((entry) => {
				if (entry.isIntersecting) this.footerSeen.set(true);
			});
		});
	}
}
```

## Cleanup

When the component or directive that called `injectIsIntersecting` is destroyed, the element is unobserved and the
stream completes (if several consumers observe the same element, that happens when the last one is destroyed). The
shared observer disconnects when no elements are left.

## SSR

`IntersectionObserver` doesn't exist on the server, so no observer is created there and the Observable doesn't emit.
Use an `initialValue` with `toSignal`, as in the examples above.

## API

```ts
function injectIsIntersecting(
	options?: InjectIsIntersectingOptions,
): Observable<IntersectionObserverEntry>;
```

| Option     | Type       | Default          | Description                                                    |
| ---------- | ---------- | ---------------- | -------------------------------------------------------------- |
| `element`  | `Element`  | the host element | The element to observe.                                        |
| `injector` | `Injector` | -                | Injector to use when you call it outside an injection context. |

Returns an `Observable<IntersectionObserverEntry>` that emits on every intersection change (entering and leaving). The
observer uses the default options: the viewport as root, no margin and a threshold of `0`.

The underlying `IsInViewportService` (`observe(element)`, `unobserve(element)`) is also exported if you need to manage
observation yourself.
