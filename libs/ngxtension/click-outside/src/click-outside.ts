import {
	Directive,
	ElementRef,
	EventEmitter,
	inject,
	Injectable,
	NgZone,
	Output,
} from '@angular/core';

import type { OnInit } from '@angular/core';
import { injectDestroy } from 'ngxtension/inject-destroy';
import { fromEvent, Subject, takeUntil } from 'rxjs';

/*
 * This service is used to detect clicks in the document.
 * It is used by the clickOutside directive.
 */
@Injectable({ providedIn: 'root' })
export class DocumentClickService {
	click$ = new Subject<Event>();

	constructor(ngZone: NgZone) {
		ngZone.runOutsideAngular(() => {
			fromEvent(document, 'click').subscribe(this.click$);
		});
	}
}

/*
 * This directive is used to detect clicks outside the element.
 *
 * Example:
 * <div (clickOutside)="close()"></div>
 *
 */
@Directive({ selector: '[clickOutside]', standalone: true })
export class ClickOutsideDirective implements OnInit {
	private ngZone = inject(NgZone);
	private elementRef = inject(ElementRef);
	private documentClick = inject(DocumentClickService);

	private destroy$ = injectDestroy();

	/*
	 * This event is emitted when a click occurs outside the element.
	 */
	@Output() clickOutside = new EventEmitter<Event>();

	ngOnInit() {
		this.documentClick.click$
			.pipe(takeUntil(this.destroy$))
			.subscribe((event: Event) => {
				const isClickedInside = this.elementRef.nativeElement.contains(
					event.target
				);

				if (!isClickedInside)
					this.ngZone.run(() => this.clickOutside.emit(event));
			});
	}
}
