import { Signal, signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Observable, catchError, delay, map, of, startWith } from 'rxjs';
import { tap } from 'rxjs/operators';
import { computedAsync } from './computed-async';

const promise = <T>(value: T, time = 0): Promise<T> =>
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

	describe('works with requireSync', () => {
		it('returns undefined for sync observables if not enabled', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = signal(1);
				const s = computedAsync(() => of(value()));
				expect(s()).toEqual(undefined); // initial value
			});
		}));
		it('returns correct value and doesnt throw error if enabled', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = signal(1);
				const s = computedAsync(() => of(value()), { requireSync: true });
				expect(s()).toEqual(1); // initial value
			});
		}));
		it('returns correct value and doesnt throw error with initial value provided', () => {
			TestBed.runInInjectionContext(() => {
				const s = computedAsync(() => of(1), { initialValue: 2 });
				expect(s()).toEqual(2); // initial value
				TestBed.flushEffects();
				expect(s()).toEqual(1);
			});
		});
		it('returns correct value and doesnt throw error with normal variable when enabled', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const s = computedAsync(() => 1, { requireSync: true });
				expect(s()).toEqual(1); // initial value
			});
		}));
		it('throws error for promises', () => {
			TestBed.runInInjectionContext(() => {
				const value = signal(1);
				expect(() => {
					const s: never = computedAsync(() => promise(value()), {
						requireSync: true,
					});
					s;
				}).toThrow(/Promises cannot be used with requireSync/i);
			});
		});
	});

	describe('works with promises', () => {
		it('waits for them to resolve', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const logs: number[] = [];
				const value = signal(1);

				const s = computedAsync(() => {
					return promise(value(), 100).then((v) => {
						logs.push(v);
						return v;
					});
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

	describe('works with contextual observables + requireSync', () => {
		it('and recovers from errors', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const loadAsyncDataLogs: number[] = [];
				function loadAsyncData(
					number: number,
					throwError = false,
				): Observable<number[]> {
					if (throwError) {
						loadAsyncDataLogs.push(number);
						return of([]).pipe(
							delay(1000),
							tap(() => {
								throw new Error('error-message');
							}),
						);
					}

					const array = Array.from({ length: number }, (_, i) => i);
					return of(array).pipe(
						tap(() => loadAsyncDataLogs.push(number)), // log the number of the request
						delay(1000), // simulate async
					);
				}

				const id = signal(1);
				let throwErrorFlag = false;

				const data: Signal<ApiCallState<number[]>> = computedAsync(
					() =>
						loadAsyncData(id(), throwErrorFlag).pipe(
							map((res) => ({ status: 'loaded' as const, result: res })),
							startWith({ status: 'loading' as const, result: [] }),
							catchError((err) => of({ status: 'error' as const, error: err })),
						),
					{ requireSync: true },
				);

				expect(data()).toEqual({ status: 'loading', result: [] });
				expect(loadAsyncDataLogs).toEqual([1]);
				tick(500);
				expect(data()).toEqual({ status: 'loading', result: [] });
				expect(loadAsyncDataLogs).toEqual([1]);
				tick(500);
				expect(data()).toEqual({ status: 'loaded', result: [0] });

				// if we don't flush effects, the effect won't run
				TestBed.flushEffects();

				id.set(2);
				TestBed.flushEffects();
				expect(loadAsyncDataLogs.length).toEqual(2);
				expect(data().status).toEqual('loading');
				tick(500);
				expect(data().status).toEqual('loading');
				tick(500);
				expect(data()).toEqual({ status: 'loaded', result: [0, 1] });
				expect(loadAsyncDataLogs).toEqual([1, 2]);

				id.set(3);
				throwErrorFlag = true;
				TestBed.flushEffects();
				expect(loadAsyncDataLogs).toEqual([1, 2, 3]);
				expect(data().status).toEqual('loading');
				tick(500);
				expect(data().status).toEqual('loading');
				tick(500);
				expect(data()).toEqual({
					status: 'error',
					error: new Error('error-message'),
				});

				id.set(4);
				throwErrorFlag = false; // should recover from error
				TestBed.flushEffects();
				expect(loadAsyncDataLogs).toEqual([1, 2, 3, 4]);
				expect(data().status).toEqual('loading');
				tick(500);
				expect(data().status).toEqual('loading');
				tick(500);
				expect(data()).toEqual({ status: 'loaded', result: [0, 1, 2, 3] });
			});
		}));
	});

	describe('is typesafe', () => {
		it('initial value', () => {
			TestBed.runInInjectionContext(() => {
				// promise
				const onePromise: Signal<number | undefined> = computedAsync(() =>
					promise(1),
				);
				const onlyPromises: Signal<number | undefined> = computedAsync(() => {
					if (Math.random() > 0.5) return Promise.resolve(1);
					return Promise.resolve(1);
				});

				// observable
				const oneObservable: Signal<number | undefined> = computedAsync(() =>
					of(1),
				);
				const onlyObservables: Signal<number | undefined> = computedAsync(
					() => {
						if (Math.random() > 0.5) return of(1);
						return of(1);
					},
				);

				// normal value
				const normalValue: Signal<number | undefined> = computedAsync(() => 1);
				const normalValue2: Signal<1 | '1' | undefined> = computedAsync(() => {
					if (Math.random() > 0.5) return 1;
					return '1';
				});

				// undefined or null
				const undefinedValue: Signal<undefined> = computedAsync(
					() => undefined,
				);
				// TODO: should we allow this?
				const nullValue: Signal<null | undefined> = computedAsync(() => null);

				const numberOrUndefined: Signal<number | undefined> = computedAsync(
					() => {
						if (Math.random() > 0.5) return 1;
						return undefined;
					},
				);

				const numberOrNull: Signal<number | null | undefined> = computedAsync(
					() => {
						if (Math.random() > 0.5) return 1;
						return null;
					},
				);

				// initialValue + normal value
				const withInitialValue: Signal<number | undefined> = computedAsync(
					() => 1,
					{ initialValue: undefined },
				);

				const withNullInitialValue: Signal<number | null> = computedAsync(
					() => 1,
					{ initialValue: null },
				);

				const withInitialValue2: Signal<number> = computedAsync(() => 1, {
					initialValue: 0,
				});
				const withInitialValue3: Signal<number[]> = computedAsync(
					() => [1, 2, 3],
					{ initialValue: [] },
				);

				// initialValue + promise
				const promiseWithInitialValue: Signal<number | undefined> =
					computedAsync(() => promise(1), { initialValue: undefined });
				const promiseWithInitialValue2: Signal<number> = computedAsync(
					() => promise(1),
					{ initialValue: 1 },
				);
				const promiseWithInitialValue3: Signal<number[]> = computedAsync(
					() => promise([1, 2, 3]),
					{ initialValue: [] },
				);

				// initialValue + observable
				const observableWithInitialValue = computedAsync(() => of(1), {
					initialValue: undefined,
				});

				const observableWithInitialValue2: Signal<number> = computedAsync(
					() => of(1),
					{ initialValue: 1 },
				);
				const observableWithInitialValue3: Signal<number[]> = computedAsync(
					() => of([1, 2, 3]),
					{ initialValue: [] },
				);

				// initialValue + undefined
				const initialValueUndefined: Signal<number | undefined> = computedAsync(
					() => 1,
					{ initialValue: undefined },
				);
				// initialValue + null
				const initialValueNull: Signal<number | null> = computedAsync(() => 1, {
					initialValue: null,
				});
				// initialValue + promise + observable -> Not supported
				const initialValuePromiseObservable = computedAsync(
					// @ts-expect-error initialValue + promise + observable -> Not supported
					() => {
						if (Math.random() > 0.5) return promise(1);
						return of(1);
					},
					{ initialValue: 1 },
				);

				// requireSync + normal value
				const requireSyncNormalValue: Signal<number> = computedAsync(() => 1, {
					requireSync: true,
				});

				expect(requireSyncNormalValue()).toEqual(1);

				const requireSyncNormalValue2: Signal<1 | '1'> = computedAsync(
					() => {
						const value = 1;
						if (value > 0.5) return 1;
						return '1';
					},
					{ requireSync: true },
				);

				expect(requireSyncNormalValue2()).toEqual(1);

				const requireSyncNormalValue3: Signal<number[]> = computedAsync(
					() => [1, 2, 3],
					{ requireSync: true },
				);

				expect(requireSyncNormalValue3()).toEqual([1, 2, 3]);

				// requireSync + promise -> Not supported
				expect(() => {
					const requireSyncPromise: never = computedAsync(() => promise(1), {
						requireSync: true,
					});
					requireSyncPromise;
				}).toThrow(/Promises cannot be used with requireSync/i);

				// requireSync + observable
				const requireSyncObservable: Signal<number> = computedAsync(
					() => of(1),
					{ requireSync: true },
				);

				expect(requireSyncObservable()).toEqual(1);

				// requireSync + initialValue
				const requireSyncNormalValue4: Signal<number> = computedAsync(() => 1, {
					requireSync: true,
					initialValue: 0,
				});

				expect(requireSyncNormalValue4()).toEqual(0);

				const requireSyncNormalValue5: Signal<number[]> = computedAsync(
					() => [1, 2, 3],
					{ requireSync: true, initialValue: [] },
				);

				expect(requireSyncNormalValue5()).toEqual([]);

				// requireSync + undefined
				const requireSyncUndefined: Signal<number | undefined> = computedAsync(
					() => 1,
					{ requireSync: true, initialValue: undefined },
				);

				expect(requireSyncUndefined()).toEqual(1);

				// requireSync + null
				const requireSyncNull: Signal<number | null> = computedAsync(() => 1, {
					requireSync: true,
					initialValue: null,
				});

				expect(requireSyncNull()).toEqual(null);

				// requireSync + initialValue + promise -> Works but Types are changed to not support it
				const requireSyncPromiseWithInitialValue: never = computedAsync(
					() => promise(1),
					{ requireSync: true, initialValue: 0 },
				);
				// @ts-expect-error promise + requireSync + initialValue -> Not supported -> Types are changed to not support it
				expect(requireSyncPromiseWithInitialValue()).toBe(0);

				// requireSync + initialValue + observable
				const requireSyncObservableWithInitialValue: Signal<number> =
					computedAsync(() => of(1), { requireSync: true, initialValue: 0 });

				expect(requireSyncObservableWithInitialValue()).toEqual(0);

				// requireSync + initialValue + undefined
				const requireSyncUndefinedWithInitialValue: Signal<number> =
					computedAsync(() => 1, {
						requireSync: true,
						initialValue: undefined,
					});

				expect(requireSyncUndefinedWithInitialValue()).toEqual(1);

				// requireSync + initialValue + null
				const requireSyncNullWithInitialValue: Signal<number | null> =
					computedAsync(() => 1, { requireSync: true, initialValue: null });

				expect(requireSyncNullWithInitialValue()).toEqual(null);

				const all = [
					onlyPromises,
					onePromise,
					oneObservable,
					onlyObservables,
					normalValue,
					normalValue2,
					undefinedValue,
					nullValue,
					numberOrUndefined,
					numberOrNull,
					withInitialValue,
					withInitialValue2,
					withInitialValue3,
					withNullInitialValue,
					promiseWithInitialValue,
					promiseWithInitialValue2,
					promiseWithInitialValue3,
					observableWithInitialValue,
					observableWithInitialValue2,
					observableWithInitialValue3,
					initialValuePromiseObservable,
					initialValueUndefined,
					initialValueNull,
				];

				all.forEach((g) => {
					expect(g()).toBe(g());
				});
			});
		});
	});
});

interface ApiCallLoading<TResult> {
	status: 'loading';
	result: TResult;
}

interface ApiCallLoaded<TResult> {
	status: 'loaded';
	result: TResult;
}

interface ApiCallError<TError> {
	status: 'error';
	error: TError;
}

export type ApiCallState<TResult, TError = string> =
	| ApiCallLoading<TResult>
	| ApiCallLoaded<TResult>
	| ApiCallError<TError>;
