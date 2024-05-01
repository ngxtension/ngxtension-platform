import { Injectable, type Type } from '@angular/core';

export function createInjectable<TFactory extends (...args: any[]) => object>(
	factory: TFactory,
	{ providedIn = 'root' }: { providedIn?: 'root' | 'platform' | 'scoped' } = {},
): Type<ReturnType<TFactory>> {
	@Injectable({ providedIn: providedIn === 'scoped' ? null : providedIn })
	class _Injectable {
		constructor() {
			const result: any = factory();

			for (const key of Reflect.ownKeys(result)) {
				Object.defineProperty(this, key, {
					get: () => result[key],
					set: (value: any) => {
						result[key] = value;
					},
					enumerable: true,
					configurable: true,
				});
			}
		}
	}

	if (factory.name) {
		Object.defineProperty(_Injectable, 'name', {
			value: `_Injectable_${factory.name}`,
		});
	}

	return _Injectable as Type<ReturnType<TFactory>>;
}
