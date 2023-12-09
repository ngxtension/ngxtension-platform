import { inject, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IsInViewportService implements IsInViewportServiceInterface {
	private ngZone = inject(NgZone);

	#observerListeners = new Map<Element, Subject<IntersectionObserverEntry>>();

	#observer?: IntersectionObserver;

	#createObserver() {
		this.#observer = this.ngZone.runOutsideAngular(() => {
			return new IntersectionObserver((entries) => {
				for (const entry of entries) {
					this.intersect(entry.target, entry);
				}
			});
		});
	}

	observe(element: Element) {
		if (!this.#observer) {
			this.#createObserver();
		}

		if (this.#observerListeners.has(element)) {
			return this.#observerListeners.get(element)!;
		}

		this.#observerListeners.set(
			element,
			new Subject<IntersectionObserverEntry>(),
		);
		this.#observer?.observe(element);

		return this.#observerListeners.get(element)!;
	}

	unobserve(element: Element) {
		this.#observer?.unobserve(element);

		this.#observerListeners.get(element)?.complete();
		this.#observerListeners.delete(element);

		if (this.#observerListeners.size === 0) {
			this.#disconnect();
		}
	}

	intersect(element: Element, entry: IntersectionObserverEntry) {
		const subject = this.#observerListeners.get(element);
		// only emit if the subject is subscribed to
		if (subject?.observed) {
			this.ngZone.run(() => subject.next(entry));
		}
	}

	#disconnect() {
		this.#observer?.disconnect();
		this.#observer = undefined;
	}
}

export interface IsInViewportServiceInterface {
	observe(element: Element): Subject<IntersectionObserverEntry>;
	unobserve(element: Element): void;
	intersect(element: Element, entry: IntersectionObserverEntry): void;
}
