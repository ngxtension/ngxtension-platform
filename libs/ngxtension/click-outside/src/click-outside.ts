import { DOCUMENT } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Directive, ElementRef, inject, NgZone, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createInjectionToken } from 'ngxtension/create-injection-token';
import { injectDestroy } from 'ngxtension/inject-destroy';
import { filter, fromEvent, Subject, takeUntil } from 'rxjs';

/*
 * This function is used to detect clicks in the document.
 * It is used by the clickOutside directive.
 */
const [injectDocumentClick] = createInjectionToken(() => {
	const click$ = new Subject<Event>();
	const [ngZone, document] = [inject(NgZone), inject(DOCUMENT)];

	ngZone.runOutsideAngular(() => {
		fromEvent(document, 'click').pipe(takeUntilDestroyed()).subscribe(click$);
	});

	return click$;
});

/*
 * This directive is used to detect clicks outside the element.
 *
 * Example:
 * <div (clickOutside)="close()"></div>
 *
 */
@Directive({ selector: '[clickOutside]', standalone: true })
export class ClickOutside implements OnInit {
	private ngZone = inject(NgZone);
	private elementRef = inject(ElementRef);
	private documentClick$ = injectDocumentClick();

	private destroy$ = injectDestroy();

	/*
	 * This event is emitted when a click occurs outside the element.
	 */
	readonly clickOutside = output<Event>();

	ngOnInit() {
		this.documentClick$
			.pipe(
				takeUntil(this.destroy$),
				filter(
					(event: Event) =>
						!this.elementRef.nativeElement.contains(event.target),
				),
			)
			.subscribe((event: Event) => {
				this.ngZone.run(() => this.clickOutside.emit(event));
			});
	}
}
