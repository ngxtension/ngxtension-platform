import { Injectable, type Type } from '@angular/core';

export function createInjectable<TFactory extends (...args: any[]) => object>(
	factory: TFactory,
	{ providedIn }: { providedIn?: 'root' } = {},
): Type<ReturnType<TFactory>> {
	@Injectable({ providedIn: providedIn || null })
	class _Injectable {
		constructor() {
			Object.assign(this, factory());
		}
	}

	return _Injectable as Type<ReturnType<TFactory>>;
}
