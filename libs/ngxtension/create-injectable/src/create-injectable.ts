import { Injectable, type Type } from '@angular/core';

export function createInjectable<TFactory extends (...args: any[]) => object>(
	factory: TFactory,
	{ providedIn = 'root' }: { providedIn?: 'root' | 'platform' | 'scoped' } = {},
): Type<ReturnType<TFactory>> {
	@Injectable({ providedIn: providedIn === 'scoped' ? null : providedIn })
	class _Injectable {
		constructor() {
			Object.assign(this, factory());
		}
	}

	if (factory.name) {
		Object.defineProperty(_Injectable, 'name', {
			value: `_Injectable_${factory.name}`,
		});
	}

	return _Injectable as Type<ReturnType<TFactory>>;
}
