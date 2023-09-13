import {
	InjectionToken,
	Injector,
	inject,
	runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assertInjector } from './assert-injector';

describe(assertInjector.name, () => {
	const token = new InjectionToken('token', {
		factory: () => 1,
	});

	function injectDummy(injector?: Injector) {
		injector = assertInjector(injectDummy, injector);
		return runInInjectionContext(injector, () => inject(token));
	}

	it('given no custom injector, when run in injection context, then return value', () => {
		TestBed.runInInjectionContext(() => {
			const value = injectDummy();
			expect(value).toEqual(1);
		});
	});

	it('given no custom injector, when run outside injection context, then throw', () => {
		expect(() => injectDummy()).toThrowError(
			/injectDummy\(\) can only be used within an injection context/i
		);
	});

	it('given a custom injector, when run in that injector context without providing number, then throw', () => {
		expect(() => injectDummy(Injector.create({ providers: [] }))).toThrowError(
			/No provider for InjectionToken/i
		);
	});

	it('given a custom injector, when run in that injector context and providing number, then return value', () => {
		const value = injectDummy(
			Injector.create({ providers: [{ provide: token, useValue: 2 }] })
		);
		expect(value).toEqual(2);
	});
});
