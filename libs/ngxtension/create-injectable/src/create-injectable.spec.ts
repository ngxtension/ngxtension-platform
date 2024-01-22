import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createInjectable } from './create-injectable';

describe(createInjectable.name, () => {
	it('should be able to access property returned from injectable', () => {
		const MyInjectable = createInjectable(() => {
			return { someProp: 1 };
		});

		TestBed.runInInjectionContext(() => {
			const service = inject(MyInjectable);
			expect(service.someProp).toEqual(1);
		});
	});
});
