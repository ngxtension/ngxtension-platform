import { signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
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
				expect(result()).toEqual(undefined); // initial value
				value.set(null);
				TestBed.flushEffects();
				expect(result()).toEqual(null);
			});
		}));
		it('objects', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = signal(0);
				const data = signal([1, 2, 3]);

				const result = computedAsync(() => {
					return data().map((v) => v + value());
				});

				expect(result()).toEqual(undefined); // initial value
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

	describe('works with previousValue', () => {
		it('and can be retrieved in the callback fn', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				// TODO(enea): the prev param has unknown type for some reason
				const s = computedAsync((previousValue: number | undefined) => {
					const v = value();
					if (previousValue !== undefined) {
						logs.push(previousValue * 1000);
					}
					return promise(v, 100).then((x) => {
						logs.push(x);
						return x;
					});
				});

				expect(s()).toEqual(undefined); // initial value
				expect(logs).toEqual([]);
				TestBed.flushEffects();
				expect(s()).toEqual(undefined); // initial value
				expect(logs).toEqual([]);
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				value.set(3);
				TestBed.flushEffects();
				expect(s()).toEqual(1); // still the old value
				expect(logs).toEqual([1, 1000]);
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(3);
				expect(logs).toEqual([1, 1000, 3]);

				value.set(4);
				TestBed.flushEffects();
				expect(s()).toEqual(3); // still the old value
				expect(logs).toEqual([1, 1000, 3, 3000]); // previousValue is 3 and it gets pushed again
				tick(100); // wait 100ms for promise to resolve
				expect(s()).toEqual(4);
				expect(logs).toEqual([1, 1000, 3, 3000, 4]);
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
				expect(s()).toEqual(undefined); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(undefined); // initial value
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

				expect(s()).toEqual(undefined); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(undefined); // initial value
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
		it('behavior: switch (default) -> previous computation', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(
					() => {
						return of(value()).pipe(
							delay(100),
							tap((v) => logs.push(v)),
						);
					},
					// { behavior: 'switch' },
				);

				expect(s()).toEqual(undefined); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(undefined); // initial value
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
		it('behavior: concat -> does not cancel previous computation', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(
					() => {
						return of(value()).pipe(
							delay(100),
							tap((v) => logs.push(v)),
						);
					},
					{ behavior: 'concat' },
				);

				expect(s()).toEqual(undefined); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(undefined); // initial value
				tick(50);
				expect(s()).toEqual(undefined); // initial value
				tick(50);
				// now we have 100ms passed
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
				expect(s()).toEqual(2);
				expect(logs).toEqual([1, 2]);

				// now the next computation starts again, so we need to wait 100ms
				tick(100); // wait 50ms
				expect(s()).toEqual(3);
				expect(logs).toEqual([1, 2, 3]);
			});
		}));
		it('behavior: merge -> runs everything in parallel', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(
					() => {
						return of(value()).pipe(
							delay(100),
							tap((v) => logs.push(v)),
						);
					},
					{ behavior: 'merge' },
				);

				expect(s()).toEqual(undefined); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(undefined); // initial value
				tick(50);
				expect(s()).toEqual(undefined); // initial value
				tick(50);
				// now we have 100ms passed
				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				value.set(2);
				TestBed.flushEffects();

				value.set(0);
				TestBed.flushEffects();

				value.set(3);
				TestBed.flushEffects();

				value.set(4);
				TestBed.flushEffects();

				tick(100); // wait 50ms
				expect(s()).toEqual(4);
				expect(logs).toEqual([1, 2, 0, 3, 4]);
			});
		}));
		it('behavior: exhaust -> skips new computations until last one completes', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(
					() => {
						return of(value()).pipe(
							delay(100),
							tap((v) => logs.push(v)),
						);
					},
					{ behavior: 'exhaust' },
				);

				expect(s()).toEqual(undefined); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(undefined); // initial value
				tick(50);
				expect(s()).toEqual(undefined); // initial value
				tick(50);
				// now we have 100ms passed
				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				value.set(2);
				TestBed.flushEffects();
				expect(s()).toEqual(1); // still the old value
				tick(50); // wait 50ms

				value.set(3);
				TestBed.flushEffects();

				expect(s()).toEqual(1);
				expect(logs).toEqual([1]);

				tick(50); // wait 50ms
				expect(s()).toEqual(2);
				expect(logs).toEqual([1, 2]);

				// now the next computation starts again, so we need to wait 100ms
				tick(100); // wait 50ms
				expect(s()).toEqual(2);
				expect(logs).toEqual([1, 2]);
			});
		}));
	});

	describe('is typesafe', () => {
		it('initial value', () => {
			TestBed.runInInjectionContext(() => {
				// : Signal<number | undefined>
				const a = computedAsync(() => {
					if (Math.random() > 0.5) return Promise.resolve(1);
					return Promise.resolve(1);
				});

				// : Signal<number | undefined>
				const b = computedAsync(() => {
					if (Math.random() > 0.5) return of(1);
					return of(1);
				});

				// : Signal<number | null>
				const c = computedAsync(
					() => {
						return 1;
					},
					{ initialValue: null },
				);

				// : Signal<string>
				const d = computedAsync(
					() => {
						return '';
					},
					{ initialValue: '' },
				);

        // : Signal<string | undefined>
				const e = computedAsync(
					() => {
						return '';
					},
					{ initialValue: undefined },
				);

				expect(a).toBeTruthy();
				expect(b).toBeTruthy();
				expect(c).toBeTruthy();
				expect(d).toBeTruthy();
				expect(e).toBeTruthy();
			});
		});
	});
});
