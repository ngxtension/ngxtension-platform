import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createInjectionToken } from './create-injection-token';

describe(createInjectionToken.name, () => {
	describe('given root injection token', () => {
		const [injectFn, , TOKEN] = createInjectionToken(() => 1);
		it('when use injectFn then return provided root value', () => {
			TestBed.runInInjectionContext(() => {
				const value = injectFn();
				expect(value).toEqual(1);
			});
		});
		it('when use TOKEN then return provided root value', () => {
			TestBed.runInInjectionContext(() => {
				const value = inject(TOKEN);
				expect(value).toEqual(1);
			});
		});
	});

	describe('given non root injection token', () => {
		const [injectFn, provideFn, TOKEN] = createInjectionToken(() => 1, {
			isRoot: false,
		});
		describe('when provide with no value', () => {
			it('then return initially provided value using injectFn', () => {
				TestBed.configureTestingModule({
					providers: [provideFn()],
				}).runInInjectionContext(() => {
					const value = injectFn();
					expect(value).toEqual(1);
				});
			});

			it('then return initially provided value using TOKEN', () => {
				TestBed.configureTestingModule({
					providers: [provideFn()],
				}).runInInjectionContext(() => {
					const value = inject(TOKEN);
					expect(value).toEqual(1);
				});
			});
		});

		describe('when provide with different value', () => {
			it('then return provided value using injectFn', () => {
				TestBed.configureTestingModule({
					providers: [provideFn(2)],
				}).runInInjectionContext(() => {
					const value = injectFn();
					expect(value).toEqual(2);
				});
			});

			it('then return provided value using TOKEN', () => {
				TestBed.configureTestingModule({
					providers: [provideFn(2)],
				}).runInInjectionContext(() => {
					const value = inject(TOKEN);
					expect(value).toEqual(2);
				});
			});
		});

		describe('when not provided', () => {
			it('then throw No Provider error', () => {
				TestBed.runInInjectionContext(() => {
					expect(() => injectFn()).toThrowError(/no provider/i);
				});
			});
		});
	});

	describe('given injection token with deps', () => {
		const [, , DEP] = createInjectionToken(() => 1);
		const [injectFn] = createInjectionToken((dep: number) => dep + 1, {
			deps: [DEP],
		});

		it('then return correct value with dep', () => {
			TestBed.runInInjectionContext(() => {
				const value = injectFn();
				expect(value).toEqual(2);
			});
		});
	});
});
