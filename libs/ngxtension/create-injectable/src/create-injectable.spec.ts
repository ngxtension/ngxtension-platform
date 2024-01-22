import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createInjectable } from './create-injectable';

describe(createInjectable.name, () => {
	it('should be able to access property returned from injectable', () => {
		const MyInjectable = createInjectable(() => ({ someProp: 1 }), {
			providedIn: 'root',
		});

		TestBed.runInInjectionContext(() => {
			const service = inject(MyInjectable);
			expect(service.someProp).toEqual(1);
		});
	});

	it('should be able to provide non-root injectable', () => {
		const MyInjectable = createInjectable(() => ({ someProp: 1 }));

		TestBed.configureTestingModule({
			providers: [MyInjectable],
		}).runInInjectionContext(() => {
			const service = inject(MyInjectable);
			expect(service.someProp).toEqual(1);
		});
	});
});
