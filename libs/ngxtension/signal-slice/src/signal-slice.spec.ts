import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { Observable, Subject, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SignalSlice, signalSlice } from './signal-slice';

describe(signalSlice.name, () => {
	const initialState = {
		user: {
			firstName: 'josh',
			lastName: 'morony',
		},
		age: 30,
		likes: ['angular', 'typescript'],
	};

	describe('initialState', () => {
		let state: SignalSlice<typeof initialState, any, any, any>;

		beforeEach(() => {
			TestBed.runInInjectionContext(() => {
				state = signalSlice({
					initialState,
				});
			});
		});

		it('should create a signal of initialState', () => {
			expect(state().user.firstName).toEqual(initialState.user.firstName);
		});

		it('should create default selectors', () => {
			expect(state.age()).toEqual(initialState.age);
		});
	});

	describe('sources', () => {
		const testSource$ = new Subject<Partial<typeof initialState>>();
		const testSource2$ = new Subject<Partial<typeof initialState>>();

		let state: SignalSlice<typeof initialState, any, any, any>;

		beforeEach(() => {
			TestBed.runInInjectionContext(() => {
				state = signalSlice({
					initialState,
					sources: [testSource$],
				});
			});
		});

		it('should be initial value initially', () => {
			expect(state().user.firstName).toEqual(initialState.user.firstName);
		});

		it('should update with value from source after emission', () => {
			const testUpdate = { user: { firstName: 'chau', lastName: 'tran' } };
			testSource$.next(testUpdate);
			expect(state().user.firstName).toEqual(testUpdate.user.firstName);
		});

		it('should work with multiple sources', () => {
			TestBed.runInInjectionContext(() => {
				state = signalSlice({
					initialState,
					sources: [testSource$, testSource2$],
				});
			});

			const testUpdate = { user: { firstName: 'chau', lastName: 'tran' } };
			const testUpdate2 = { age: 20 };
			testSource$.next(testUpdate);
			testSource2$.next(testUpdate2);

			expect(state().user.firstName).toEqual(testUpdate.user.firstName);
			expect(state().age).toEqual(testUpdate2.age);
		});

		it('should allow supplying function that takes state signal', () => {
			const ageSource$ = new Subject<number>();

			TestBed.runInInjectionContext(() => {
				state = signalSlice({
					initialState,
					sources: [
						testSource$,
						(state) =>
							ageSource$.pipe(
								map((incrementAge) => ({ age: state().age + incrementAge }))
							),
					],
				});
			});

			const incrementAge = 5;
			ageSource$.next(incrementAge);

			expect(state().age).toEqual(initialState.age + incrementAge);
		});
	});

	describe('actionSources', () => {
		it('should create action that updates signal', () => {
			TestBed.runInInjectionContext(() => {
				const state = signalSlice({
					initialState,
					actionSources: {
						increaseAge: (state, $: Observable<number>) =>
							$.pipe(map((amount) => ({ age: state().age + amount }))),
					},
				});

				const amount = 1;
				state.increaseAge(amount);
				expect(state().age).toEqual(initialState.age + amount);
			});
		});

		it('should create action stream for reducer', () => {
			TestBed.runInInjectionContext(() => {
				const state = signalSlice({
					initialState,
					actionSources: {
						increaseAge: (state, $: Observable<number>) =>
							$.pipe(map((amount) => ({ age: state().age + amount }))),
					},
				});

				expect(state.increaseAge$).toBeDefined();
			});
		});

		it('should resolve the updated state as a promise after reducer is invoked', (done) => {
			TestBed.runInInjectionContext(() => {
				const state = signalSlice({
					initialState,
					actionSources: {
						increaseAge: (state, $: Observable<number>) =>
							$.pipe(map((amount) => ({ age: state().age + amount }))),
					},
				});

				state.increaseAge(1).then((updated) => {
					expect(updated.age).toEqual(initialState.age + 1);
					done();
				});

				TestBed.flushEffects();
			});
		});

		it('should accept an external subject as a reducer', () => {
			TestBed.runInInjectionContext(() => {
				const testAge = 50;

				const trigger$ = new Subject<void>();
				const state = signalSlice({
					initialState,
					sources: [trigger$.pipe(map(() => ({ age: testAge })))],
					actionSources: {
						trigger: trigger$,
					},
				});

				state.trigger();

				expect(state().age).toEqual(testAge);
			});
		});

		it('should create action that updates signal asynchronously', () => {
			TestBed.runInInjectionContext(() => {
				const testAge = 35;

				const state = signalSlice({
					initialState,
					actionSources: {
						load: (state, $: Observable<void>) =>
							$.pipe(
								switchMap(() => of(testAge)),
								map((age) => ({ age }))
							),
					},
				});

				state.load();
				expect(state().age).toEqual(testAge);
			});
		});

		it('should create action stream for reducer', () => {
			TestBed.runInInjectionContext(() => {
				const state = signalSlice({
					initialState,
					actionSources: {
						load: (state, $: Observable<void>) =>
							$.pipe(
								switchMap(() => of(35)),
								map((age) => ({ age }))
							),
					},
				});

				expect(state.load$).toBeDefined();
			});
		});

		it('should resolve to the updated state when async reducer is invoked with a raw value', (done) => {
			TestBed.runInInjectionContext(() => {
				const state = signalSlice({
					initialState,
					actionSources: {
						load: (_state, $: Observable<void>) =>
							$.pipe(
								switchMap(() => of(35)),
								map((age) => ({ age }))
							),
					},
				});

				state.load().then((val) => {
					expect(val.age).toEqual(35);
					done();
				});
				TestBed.flushEffects();
			});
		});

		it('should resolve to the updated state when async reducer is invoked with a stream and that stream is completed', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const age$ = new Subject<number>();

				const state = signalSlice({
					initialState,
					actionSources: {
						load: (_state, $: Observable<number>) =>
							$.pipe(
								switchMap((age) =>
									timer(500).pipe(map(() => ({ age: 35 + age })))
								)
							),
					},
				});

				state.load(age$).then((val) => {
					expect(val.age).toEqual(40);
					flush();
				});

				age$.next(1);
				tick(500);

				age$.next(2);
				tick(500);

				age$.next(3);
				tick(500);

				age$.next(4);
				tick(500);

				age$.next(5);
				tick(500);

				// NOTE: promise won't resolve until the stream is completed
				age$.complete();
				TestBed.flushEffects();
			});
		}));
	});

	describe('selectors', () => {
		it('should add custom selectors to state object', () => {
			TestBed.runInInjectionContext(() => {
				const state = signalSlice({
					initialState,
					selectors: (state) => ({
						doubleAge: () => state().age * 2,
					}),
				});

				expect(state.doubleAge()).toEqual(state().age * 2);
			});
		});
	});

	describe('effects', () => {
		it('should create effects for named effects', () => {
			TestBed.runInInjectionContext(() => {
				const testFn = jest.fn();

				const state = signalSlice({
					initialState,
					actionSources: {
						increaseAge: (state, $: Observable<void>) =>
							$.pipe(map(() => ({ age: state().age + 1 }))),
					},
					effects: (state) => ({
						doSomething: () => {
							testFn(state.age());
						},
					}),
				});

				TestBed.flushEffects();
				expect(testFn).toHaveBeenCalledWith(initialState.age);

				state.increaseAge();
				TestBed.flushEffects();

				expect(testFn).toHaveBeenCalledWith(initialState.age + 1);
			});
		});

		it('should only run effect with updated signal', () => {
			TestBed.runInInjectionContext(() => {
				const initFn = jest.fn();
				const testFn = jest.fn();

				const state = signalSlice({
					initialState,
					actionSources: {
						increaseAge: (state, $: Observable<void>) =>
							$.pipe(map(() => ({ age: state().age + 1 }))),
					},
					effects: (state) => ({
						init: () => {
							initFn();
						},
						doSomething: () => {
							testFn(state.age());
						},
					}),
				});

				TestBed.flushEffects();
				expect(initFn).toHaveBeenCalledTimes(1);
				expect(testFn).toHaveBeenCalledTimes(1);

				state.increaseAge();
				TestBed.flushEffects();

				expect(initFn).toHaveBeenCalledTimes(1);
				expect(testFn).toHaveBeenCalledTimes(2);
			});
		});
	});
});
