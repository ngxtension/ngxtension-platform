import { inject, Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IsInViewportService implements IsInViewportServiceInterface {
	private readonly ngZone = inject(NgZone);

	private observerListeners = new Map<
		Element,
		Subject<IntersectionObserverEntry>
	>();
	private observer?: IntersectionObserver;

	private createObserver() {
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
