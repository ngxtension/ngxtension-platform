import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
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
		let state: SignalSlice<typeof initialState, any, any>;

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

		let state: SignalSlice<typeof initialState, any, any>;

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
});
