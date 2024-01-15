import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { delay, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { computedAsync } from './computed-async';

const promise = <T>(value: T, time: number = 0): Promise<T> =>
	new Promise((resolve) => setTimeout(() => resolve(value), time));

describe(computedAsync.name, () => {
	describe('works with raw values', () => {
		it('null & undefined', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = signal<null | undefined>(null);
				const result = computedAsync(() => value());
				expect(result()).toEqual(null); // initial value
				value.set(undefined);
				TestBed.flushEffects();
				expect(result()).toEqual(undefined);
			});
		}));
		it('objects', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = signal(0);
				const data = signal([1, 2, 3]);

				const result = computedAsync(() => {
					return data().map((v) => v + value());
				});

				expect(result()).toEqual(null); // initial value
				TestBed.flushEffects();
				expect(result()).toEqual([1, 2, 3]);
				value.set(1);
				TestBed.flushEffects();
				expect(result()).toEqual([2, 3, 4]);
			});
		}));
		it('initialValue', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = signal(0);
				const data = signal([1, 2, 3]);

				const result = computedAsync(
					() => {
						return data().map((v) => v + value());
					},
					{ initialValue: [] },
				);

				expect(result()).toEqual([]); // initial value
				TestBed.flushEffects();
				expect(result()).toEqual([1, 2, 3]);
				value.set(1);
				TestBed.flushEffects();
				expect(result()).toEqual([2, 3, 4]);
			});
		}));
	});

	describe('works with promises', () => {
		it('waits for them to resolve', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(() => {
					return promise(value(), 100).then((v) => logs.push(v));
				});
				expect(s()).toEqual(null); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(null); // initial value
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				value.set(2);
				TestBed.flushEffects();
				expect(s()).toEqual(1); // still the old value
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(2);
				expect(logs).toEqual([1, 2]);
			});
		}));
	});

	describe('works with observables', () => {
		it('waits for them to resolve', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(() => {
					return of(value()).pipe(
						delay(100),
						tap((v) => logs.push(v)),
					);
				});

				expect(s()).toEqual(null); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(null); // initial value
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				value.set(2);
				TestBed.flushEffects();
				expect(s()).toEqual(1); // still the old value
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(2);
				expect(logs).toEqual([1, 2]);
			});
		}));
		it('cancels previous computation', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(() => {
					return of(value()).pipe(
						delay(100),
						tap((v) => logs.push(v)),
					);
				});

				expect(s()).toEqual(null); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(null); // initial value
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				value.set(2);
				TestBed.flushEffects();
				expect(s()).toEqual(1); // still the old value

				tick(50); // wait 50ms

				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				value.set(3);
				TestBed.flushEffects();

				tick(50); // wait 50ms
				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				tick(50); // wait 50ms
				expect(s()).toEqual(3);
				expect(logs).toEqual([1, 3]);

				// 2 was skipped -> the computation was cancelled
			});
		}));
	});
});
