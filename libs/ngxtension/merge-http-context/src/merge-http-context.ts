import { HttpContext } from '@angular/common/http';

/**
 * Merge multiple HttpContext.
 *
 * @param contexts Two or more http contexts to be merged.
 * @returns A merged HttpContext.
 *
 */

export function mergeHttpContext(...contexts: HttpContext[]): HttpContext {
	return contexts.reduce((prev, curr) => {
		Array.from(curr.keys()).forEach((contextToken) =>
			prev.set(contextToken, curr.get(contextToken)),
		);
		return prev;
	}, new HttpContext());
}
