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
			// increment prop
			service.someProp += 1;
		});

		TestBed.runInInjectionContext(() => {
			// should be lazy until `inject()` is invoked
			expect(count).toEqual(0);
			const service = inject(MyInjectable);
			// should still be 1 after `inject` because it is a singleton
			expect(count).toEqual(1);
			// should be 2 because previous test incremented it
			expect(service.someProp).toEqual(2);
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
			service.someProp += 1;
		});

		TestBed.resetTestingModule()
			.configureTestingModule({ providers: [MyInjectable] })
			.runInInjectionContext(() => {
				// should be 1 before `inject`
				expect(count).toEqual(1);
				const service = inject(MyInjectable);
				// should be 2 after `inject` because it is not a singleton
				expect(count).toEqual(2);
				// should equal 1 because it is not a singleton
				expect(service.someProp).toEqual(1);
			});
	});
});
