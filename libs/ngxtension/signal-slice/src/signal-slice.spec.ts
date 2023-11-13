import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of } from 'rxjs';
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
		let state: SignalSlice<typeof initialState, any, any, any, any>;

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

		let state: SignalSlice<typeof initialState, any, any, any, any>;

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

	describe('reducers', () => {
		it('should create action that updates signal', () => {
			TestBed.runInInjectionContext(() => {
				const state = signalSlice({
					initialState,
					reducers: {
						increaseAge: (state, amount: number) => ({
							age: state.age + amount,
						}),
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
					reducers: {
						increaseAge: (state, amount: number) => ({
							age: state.age + amount,
						}),
					},
				});
				expect(state.increaseAge$).toBeDefined();
			});
		});
	});

	describe('asyncReducers', () => {
		it('should create action that updates signal asynchronously', () => {
			TestBed.runInInjectionContext(() => {
				const testAge = 35;

				const state = signalSlice({
					initialState,
					asyncReducers: {
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
					asyncReducers: {
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
		xit('should create effects for named effects', () => {
			// TODO: enable this test when flushEffects is available
			TestBed.runInInjectionContext(() => {
				const testFn = jest.fn();

				const state = signalSlice({
					initialState,
					reducers: {
						increaseAge: (state) => ({ age: state.age + 1 }),
					},
					effects: (state) => ({
						doSomething: () => {
							testFn(state.age());
						},
					}),
				});

				state.increaseAge();

				expect(testFn).toHaveBeenCalledWith(initialState.age);
				expect(testFn).toHaveBeenCalledWith(initialState.age + 1);
			});
		});

		xit('should only run effect with updated signal', () => {
			// TODO: enable this test when flushEffects is available
			TestBed.runInInjectionContext(() => {
				const initFn = jest.fn();
				const testFn = jest.fn();

				const state = signalSlice({
					initialState,
					reducers: {
						increaseAge: (state) => ({ age: state.age + 1 }),
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

				state.increaseAge();

				expect(initFn).toHaveBeenCalledTimes(1);
				expect(testFn).toHaveBeenCalledTimes(2);
			});
		});
	});
});
