import {
	DestroyRef,
	inject,
	runInInjectionContext,
	type Injector,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { ReplaySubject } from 'rxjs';

/**
 * Injects the `DestroyRef` service and returns a `ReplaySubject` that emits
 * when the component is destroyed.
 *
 * @throws {Error} If no `DestroyRef` is found.
 * @returns {ReplaySubject<void>} A `ReplaySubject` that emits when the component is destroyed.
 *
 * @example
 * // In your component:
 * export class MyComponent {
 *   private destroy$ = injectDestroy();
 *
 *   getData() {
 *     return this.service.getData()
 *       .pipe(takeUntil(this.destroy$))
 *       .subscribe(data => { ... });
 *   }
 * }
 */
export const injectDestroy = (
	injector?: Injector
): ReplaySubject<void> & { onDestroy: DestroyRef['onDestroy'] } => {
	injector = assertInjector(injectDestroy, injector);

	return runInInjectionContext(injector, () => {
		const destroyRef = inject(DestroyRef);

		const subject$ = new ReplaySubject<void>(1);

		destroyRef.onDestroy(() => {
			subject$.next();
			subject$.complete();
		});

		Object.assign(subject$, {
			onDestroy: destroyRef.onDestroy.bind(destroyRef),
		});

		return subject$ as ReplaySubject<void> & {
			onDestroy: DestroyRef['onDestroy'];
		};
	});
};
