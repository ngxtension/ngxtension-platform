import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { injectNavigationEnd } from 'ngxtension/navigation-end';
import { map } from 'rxjs';

/**
 * Injects the deepest (leaf) activated route as a signal.
 *
 * This function returns a signal that always contains the current leaf route in the router state tree.
 * The leaf route is the deepest child route that has no children of its own. This is useful when you
 * need to access route information from the currently active, deepest route regardless of your
 * component's position in the route hierarchy.
 *
 * The signal updates automatically whenever navigation ends, ensuring it always reflects the current
 * leaf route even when navigating to the same URL (depending on your router configuration's
 * `OnSameUrlNavigation` setting).
 *
 * @returns A signal containing the current leaf ActivatedRoute
 *
 * @example
 * ```ts
 * @Component({
 *   template: `
 *     <div>Current route: {{ leafRoute().snapshot.url }}</div>
 *     <div>Route params: {{ leafRoute().snapshot.params | json }}</div>
 *   `
 * })
 * export class MyComponent {
 *   leafRoute = injectLeafActivatedRoute();
 * }
 * ```
 *
 * @example
 * Access params from the leaf route
 * ```ts
 * @Component({})
 * export class MyComponent {
 *   leafRoute = injectLeafActivatedRoute();
 *   userId = computed(() => this.leafRoute().snapshot.params['id']);
 * }
 * ```
 */
export function injectLeafActivatedRoute() {
	const router = inject(Router);
	const navigationEnd$ = injectNavigationEnd();

	return toSignal(
		// Map each navigation end event to the current leaf route
		navigationEnd$.pipe(map(() => walkToDeepest(router.routerState.root))),
		{
			// Set the initial value immediately with the current leaf route
			initialValue: walkToDeepest(router.routerState.root),
			// Always emit when navigation ends, even if technically navigating to the same route
			// This ensures the signal updates consistently with your router's OnSameUrlNavigation behavior
			// @see [OnSameUrlNavigation](https://angular.dev/api/router/OnSameUrlNavigation)
			equal: () => false,
		},
	);
}

/**
 * Recursively walks down the ActivatedRoute tree to find the deepest (leaf) child route.
 *
 * The Angular router organizes routes in a tree structure where parent routes can have
 * child routes. This function traverses the tree by following the `firstChild` references
 * until it reaches a route with no children, which is considered the "leaf" route.
 *
 * @param step - The current ActivatedRoute node to start traversing from
 * @returns The deepest ActivatedRoute in the tree (the leaf route with no children)
 *
 * @example
 * ```ts
 * // Given route tree: /parent/child/grandchild
 * const root = router.routerState.root;
 * const leaf = walkToDeepest(root);
 * // leaf will be the ActivatedRoute for 'grandchild'
 * ```
 */
export function walkToDeepest(step: ActivatedRoute): ActivatedRoute {
	// Recursively traverse to the first child until we reach a route with no children
	return step.firstChild ? walkToDeepest(step.firstChild) : step;
}
