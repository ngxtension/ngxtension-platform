import { DOCUMENT } from '@angular/common';
import { inject, Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEvent, map, merge, shareReplay } from 'rxjs';

export function injectActiveElement(injector?: Injector) {
	return assertInjector(injectActiveElement, injector, () => {
		const doc = inject(DOCUMENT);
		return merge(
			fromEvent(doc, 'focus', { capture: true, passive: true }).pipe(
				map(() => true)
			),
			fromEvent(doc, 'blur', { capture: true, passive: true }).pipe(
				map(() => false)
			)
		).pipe(
			map((hasFocus) => (hasFocus ? doc.activeElement : null)),
			shareReplay({ refCount: true, bufferSize: 1 })
		);
	});
}
