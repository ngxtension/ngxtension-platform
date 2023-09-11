import { Injector, assertInInjectionContext, inject } from '@angular/core';

export function assertInjector(
	fn: Function,
	injector: Injector | undefined | null
): Injector {
	!injector && assertInInjectionContext(fn);
	return injector ?? inject(Injector);
}
