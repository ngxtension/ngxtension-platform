import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createInjectable } from './create-injectable';

describe(createInjectable.name, () => {
	it('should be able to access property returned from injectable', () => {
		let count = 0;
		const MyInjectable = createInjectable(
			() => {
				count += 1;
				return { someProp: 1 };
			},
			{ providedIn: 'root' },
		);

		TestBed.runInInjectionContext(() => {
			// should be lazy until `inject()` is invoked
			expect(count).toEqual(0);
			const service = inject(MyInjectable);
			expect(count).toEqual(1);
			expect(service.someProp).toEqual(1);
		});
	});

	it('should be able to provide non-root injectable', () => {
		let count = 0;
		const MyInjectable = createInjectable(() => {
			count += 1;
			return { someProp: 1 };
		});

		TestBed.configureTestingModule({
			providers: [MyInjectable],
		}).runInInjectionContext(() => {
			// should still be lazy until `inject()` is invoked
			expect(count).toEqual(0);
			const service = inject(MyInjectable);
			expect(count).toEqual(1);
			expect(service.someProp).toEqual(1);
		});
	});
});
