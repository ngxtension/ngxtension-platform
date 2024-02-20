import { effect } from '@angular/core';
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
});
