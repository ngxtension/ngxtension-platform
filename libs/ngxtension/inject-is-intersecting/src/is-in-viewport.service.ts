import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IsInViewportService implements IsInViewportServiceInterface {
	private readonly ngZone = inject(NgZone);
	private readonly platformId = inject(PLATFORM_ID);

	private observerListeners = new Map<
		Element,
		Subject<IntersectionObserverEntry>
	>();
	private observerCounts = new Map<Element, number>(); // ref count per element
	private observer?: IntersectionObserver;

	private createObserver() {
		if (!isPlatformBrowser(this.platformId)) return; // IntersectionObserver is not available on the server
		this.observer = this.ngZone.runOutsideAngular(() => {
			return new IntersectionObserver((entries) => {
				for (const entry of entries) {
					this.intersect(entry.target, entry);
				}
			});
		});
	}

	observe(element: Element): Observable<IntersectionObserverEntry> {
		if (!this.observer) {
			this.createObserver();
		}

		// Increment ref count regardless of whether the element is already observed
		this.observerCounts.set(
			element,
			(this.observerCounts.get(element) ?? 0) + 1,
		);

		if (this.observerListeners.has(element)) {
			return this.observerListeners.get(element)!.asObservable();
		}

		this.observerListeners.set(
			element,
			new Subject<IntersectionObserverEntry>(),
		);
		this.observer?.observe(element);

		return this.observerListeners.get(element)!.asObservable();
	}

	unobserve(element: Element): void {
		if (!this.observerCounts.has(element)) {
			return;
		}

		const count = this.observerCounts.get(element)! - 1;

		if (count > 0) {
			// Other consumers are still alive — just decrement and bail
			this.observerCounts.set(element, count);
			return;
		}

		// Last consumer gone — fully tear down this element
		this.observerCounts.delete(element);
		this.observer?.unobserve(element);

		this.observerListeners.get(element)?.complete();
		this.observerListeners.delete(element);

		if (this.observerListeners.size === 0) {
			this.disconnect();
		}
	}

	private intersect(element: Element, entry: IntersectionObserverEntry): void {
		const subject = this.observerListeners.get(element);
		if (subject?.observed) {
			this.ngZone.run(() => subject.next(entry));
		}
	}

	private disconnect(): void {
		this.observer?.disconnect();
		this.observer = undefined;
	}
}

export interface IsInViewportServiceInterface {
	observe(element: Element): Observable<IntersectionObserverEntry>;
	unobserve(element: Element): void;
}
