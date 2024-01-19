import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { toObservableSignal } from './to-observable-signal';

describe('toObservableSignal()', () => {
	it('should return a <WritableSignal & Observable> when input is WritableSignal', () => {
		const s = signal<string>('Hello');

		const injector = TestBed.inject(Injector);
		const observableSignal = toObservableSignal(s, { injector });

		expect(observableSignal).toEqual(s);
		expect(observableSignal.subscribe).toBeDefined();
		expect(observableSignal.pipe).toBeDefined();
		expect(observableSignal.set).toBeDefined();
		expect(observableSignal.update).toBeDefined();
		expect(observableSignal.asReadonly).toBeDefined();
		expect(typeof observableSignal).toEqual('function');
		expect(observableSignal()).toEqual('Hello');
	});

	it('should return an ObservableSignal when input is Signal', () => {
		const s = signal<string>('Hello').asReadonly();

		const injector = TestBed.inject(Injector);
		const observableSignal = toObservableSignal(s, { injector });

		expect(observableSignal).toEqual(s);
		expect(observableSignal.subscribe).toBeDefined();
		expect(observableSignal.pipe).toBeDefined();
		expect((observableSignal as any)['set']).toBeUndefined();
		expect((observableSignal as any)['update']).toBeUndefined();
		expect((observableSignal as any)['asReadonly']).toBeUndefined();
		expect(typeof observableSignal).toEqual('function');
		expect(observableSignal()).toEqual('Hello');
	});

	it('should emit the value of the original signal as an observable', (done) => {
		const s = signal<string>('Hello');

		const injector = TestBed.inject(Injector);
		const observableSignal = toObservableSignal(s, { injector });
		TestBed.flushEffects();

		observableSignal.subscribe((value) => {
			expect(value).toBe('Hello');
			done();
		});
	});

	it('should emit the updated value when the original signal changes', (done) => {
		const s = signal<string>('Hello');

		const injector = TestBed.inject(Injector);
		const observableSignal = toObservableSignal(s, { injector });

		s.set('World');
		TestBed.flushEffects();

		observableSignal.subscribe((value) => {
			expect(value).toBe('World');
			done();
		});
	});
});
