import { selectSignal } from './select-signal';
import { signalStore, signalStoreInjector } from './signal-store';

describe(signalStore.name, () => {
	const initialState = {
		user: {
			firstName: 'John',
			lastName: 'Smith',
		},
		foo: 'bar',
		numbers: [1, 2, 3],
	};

	type State = typeof initialState;

	describe('given store with initial state', () => {
		function setup() {
			return signalStore(initialState, signalStoreInjector());
		}

		it('then snapshot should work properly', () => {
			const store = setup();
			expect(store.snapshot).toEqual(initialState);

			store.set((state) => ({ numbers: [...state.numbers, 4] }));
			expect(store.snapshot).toEqual({
				...initialState,
				numbers: [...initialState.numbers, 4],
			});
			expect(store.snapshot.user).toBe(initialState.user);
		});

		it('then nested signals should work properly', () => {
			const store = setup();
			expect(store.user()).toEqual(initialState.user);
			expect(store.user.firstName()).toEqual(initialState.user.firstName);

			store.set((state) => ({ user: { ...state.user, firstName: 'chau' } }));
			expect(store.user()).toEqual({ ...initialState.user, firstName: 'chau' });
			expect(store.user.firstName()).toEqual('chau');
		});

		it('then selectSignal should work properly', () => {
			const store = setup();
			const fullName = selectSignal(
				store.user.firstName,
				store.user.lastName,
				(firstName, lastName) => `${firstName} ${lastName}`
			);

			expect(fullName()).toEqual(
				initialState.user.firstName + ' ' + initialState.user.lastName
			);

			store.set({ user: { firstName: 'chau', lastName: 'tran' } });
			expect(fullName()).toEqual('chau tran');
		});
	});

	describe('given store with functional initial state', () => {
		function setup() {
			return signalStore<State & { setFirstname: (firstName: string) => void }>(
				({ snapshot, set }) => ({
					...initialState,
					setFirstname: (firstName) => {
						set({ user: { ...snapshot.user, firstName } });
					},
				}),
				signalStoreInjector()
			);
		}

		it('then snapshot should work properly', () => {
			const store = setup();
			expect(store.snapshot).toEqual({
				...initialState,
				setFirstname: expect.any(Function),
			});

			const setFirstname = store.setFirstname();
			setFirstname('chau');
			expect(store.snapshot.user.firstName).toEqual('chau');
		});

		it('then nested signal should work properly', () => {
			const store = setup();
			expect(store.user()).toEqual(initialState.user);
			expect(store.user.firstName()).toEqual(initialState.user.firstName);

			const setFirstname = store.setFirstname();
			setFirstname('chau');
			expect(store.user.firstName()).toEqual('chau');
		});
	});
});
