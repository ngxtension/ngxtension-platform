import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { injectNavigationEnd } from 'ngxtension/navigation-end';
import { map } from 'rxjs';

export function injectLeafActivatedRoute() {
	const router = inject(Router);
	const navigationEnd$ = injectNavigationEnd();

	const walkToDeepest = (step: ActivatedRoute): ActivatedRoute =>
		step.firstChild ? walkToDeepest(step.firstChild) : step;

	return toSignal(
		navigationEnd$.pipe(map(() => walkToDeepest(router.routerState.root))),
		{
			initialValue: walkToDeepest(router.routerState.root),
			// Behave 1:1 how your application's router is setup
			// @see [OnSameUrlNavigation ignore](https://angular.dev/api/router/OnSameUrlNavigation)
			equal: () => false,
		},
	);
}
