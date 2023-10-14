import { DOCUMENT } from '@angular/common';
import { assertInInjectionContext, inject, type Injector } from '@angular/core';
import { fromEvent, map, merge, shareReplay } from 'rxjs';

export function injectActiveElement(injector?: Injector) {
	injector ?? assertInInjectionContext(injectActiveElement);
	const doc = injector ? injector.get(DOCUMENT) : inject(DOCUMENT);

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
}
