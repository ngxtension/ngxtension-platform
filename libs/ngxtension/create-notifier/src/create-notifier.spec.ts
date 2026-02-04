import { effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNotifier } from './create-notifier';

describe(createNotifier.name, () => {
	it('should trigger on init', () => {
		TestBed.runInInjectionContext(() => {
			const testFn = jest.fn();
			const trigger = createNotifier();

			effect(() => {
				trigger.listen();
				testFn();
			});

			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalled();
		});
	});

	it('should allow not triggering until explicitly called', () => {
		TestBed.runInInjectionContext(() => {
			const testFn = jest.fn();
			const trigger = createNotifier();

			effect(() => {
				if (trigger.listen()) {
					testFn();
				}
			});

			TestBed.flushEffects();
			expect(testFn).not.toHaveBeenCalled();

			trigger.notify();

			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalled();
		});
	});

	it('should continue to trigger when additional calls are made', () => {
		TestBed.runInInjectionContext(() => {
			const testFn = jest.fn();
			const trigger = createNotifier();

			effect(() => {
				if (trigger.listen()) {
					testFn();
				}
			});

			TestBed.flushEffects();
			expect(testFn).not.toHaveBeenCalled();

			trigger.notify();

			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(1);

			trigger.notify();
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(2);
		});
	});

	it('should work with options.deps', () => {
		TestBed.runInInjectionContext(() => {
			let notifyValue: number;
			const dep1 = signal<any>(null);
			const dep2 = signal<any>(null);
			const testFn = jest.fn();
			const trigger = createNotifier({ deps: [dep1, dep2] });

			effect(() => {
				notifyValue = trigger.listen();
				testFn();
			});

			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(1);
			expect(notifyValue!).toBe(1);

			trigger.notify();
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(2);
			expect(notifyValue!).toBe(2);

			dep1.set(1);
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(3);
			expect(notifyValue!).toBe(3);

			dep1.set(2);
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(4);
			expect(notifyValue!).toBe(4);

			dep1.set(2);
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(4);
			expect(notifyValue!).toBe(4);

			trigger.notify();
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(5);
			expect(notifyValue!).toBe(5);
		});
	});

	it('should work with options.deps and options.depsEmitInitially=false', () => {
		TestBed.runInInjectionContext(() => {
			let notifyValue: number;
			const dep1 = signal<any>(null);
			const dep2 = signal<any>(null);
			const testFn = jest.fn();
			const trigger = createNotifier({
				deps: [dep1, dep2],
				depsEmitInitially: false,
			});

			effect(() => {
				notifyValue = trigger.listen();
				testFn();
			});

			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(1);
			expect(notifyValue!).toBe(0);

			trigger.notify();
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(2);
			expect(notifyValue!).toBe(1);

			dep1.set(1);
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(3);
			expect(notifyValue!).toBe(2);

			dep1.set(2);
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(4);
			expect(notifyValue!).toBe(3);

			dep1.set(2);
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(4);
			expect(notifyValue!).toBe(3);

			trigger.notify();
			TestBed.flushEffects();
			expect(testFn).toHaveBeenCalledTimes(5);
			expect(notifyValue!).toBe(4);
		});
	});
});
