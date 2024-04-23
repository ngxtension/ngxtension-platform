import { DOCUMENT } from '@angular/common';
import type { OnInit } from '@angular/core';
import {
	Directive,
	ElementRef,
	EventEmitter,
	inject,
	NgZone,
	Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createInjectionToken } from 'ngxtension/create-injection-token';
import { filter, fromEvent, Subject } from 'rxjs';

/*
 * This function is used to detect clicks in the document.
 * It is used by the clickOutside directive.
 */
const [injectDocumentClick, provideDocumentClick] = createInjectionToken(
	() => {
		const click$ = new Subject<Event>();
		const [ngZone, document] = [inject(NgZone), inject(DOCUMENT)];

		ngZone.runOutsideAngular(() => {
			fromEvent(document, 'click').pipe(takeUntilDestroyed()).subscribe(click$);
		});

		return click$.asObservable();
	},
	{ isRoot: false },
);

/*
 * This directive is used to detect clicks outside the element.
 *
 * Example:
 * <div (clickOutside)="close()"></div>
 *
 */
@Directive({
	selector: '[clickOutside]',
	standalone: true,
	providers: [provideDocumentClick()],
})
export class ClickOutside implements OnInit {
	private ngZone = inject(NgZone);
	private elementRef = inject(ElementRef);
	private documentClick$ = injectDocumentClick();

	/*
	 * This event is emitted when a click occurs outside the element.
	 */
	@Output() clickOutside = new EventEmitter<Event>();

	ngOnInit() {
		this.documentClick$
			.pipe(
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
