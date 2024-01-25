import { effect, signal } from '@angular/core';
import {
	TestBed,
	discardPeriodicTasks,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { ReplaySubject, map, timer } from 'rxjs';
import { mergeFrom } from './merge-from';

describe(mergeFrom.name, () => {
	it('should work with signals', () => {
		const values: any[] = [];
		const value = signal(1);
		const valueTwo = signal(2);

		TestBed.runInInjectionContext(() => {
			const merged = mergeFrom([value, valueTwo]);

			effect(() => {
				values.push(merged());
			});
			TestBed.flushEffects();

			value.set(-1);
			TestBed.flushEffects();

			valueTwo.set(3);
			TestBed.flushEffects();

			expect(values).toEqual([2, -1, 3]);
		});
	});

	it('should work with observables', () => {
		const values: any[] = [];
		const value = new ReplaySubject<number>(1);
		const valueTwo = new ReplaySubject<number>(1);

		TestBed.runInInjectionContext(() => {
			const merged = mergeFrom([value, valueTwo], { initialValue: 1 });

			effect(() => {
				values.push(merged());
			});
			TestBed.flushEffects();

			value.next(-1);
			TestBed.flushEffects();

			valueTwo.next(3);
			TestBed.flushEffects();

			expect(values).toEqual([1, -1, 3]);
		});
	});

	it('should work with both and timing', fakeAsync(() => {
		const values: any[] = [];
		const value = signal(1);
		const value$ = timer(0, 1000).pipe(map((val) => val * 2));

		TestBed.runInInjectionContext(() => {
			const merged = mergeFrom(
				[value, value$],
				map((val) => val + 10),
			);

			effect(() => {
				values.push(merged());
			});
			TestBed.flushEffects();

			value.set(-1);
			TestBed.flushEffects();

			tick(1000);
			TestBed.flushEffects();

			value.set(3);
			TestBed.flushEffects();

			tick(1000);
			TestBed.flushEffects();

			tick(1000);
			TestBed.flushEffects();

			discardPeriodicTasks();

			expect(values).toEqual([11, 9, 10, 12, 13, 14, 16]);
		});
	}));
});
