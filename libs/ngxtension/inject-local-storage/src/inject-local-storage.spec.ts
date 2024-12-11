import { effect } from '@angular/core';
import {
	getActiveConsumer,
	ReactiveNode,
} from '@angular/core/primitives/signals';
import { TestBed } from '@angular/core/testing';
import { injectLocalStorage } from './inject-local-storage';

describe('injectLocalStorage', () => {
	const key = 'testKey';

	afterEach(() => {
		localStorage.clear();
	});

	describe('with primitive', () => {
		it('should set a value in localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const localStorageSignal = injectLocalStorage<string>(key);
				const testValue = 'value';

				localStorageSignal.set(testValue);

				expect(localStorage.getItem(key)).toEqual(JSON.stringify(testValue));
			});
		});

		it('should get a undefined value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const localStorageSignal = injectLocalStorage<string>(key);

				expect(localStorageSignal()).toBeUndefined();
			});
		});

		it('should return defaultValue of type string', () => {
			TestBed.runInInjectionContext(() => {
				const defaultValue = 'default';
				const localStorageSignal = injectLocalStorage<string>(key, {
					defaultValue,
				});

				expect(localStorageSignal()).toEqual(defaultValue);
			});
		});

		it('should get the current value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = 'value';
				localStorage.setItem(key, JSON.stringify(testValue));

				const localStorageSignal = injectLocalStorage<string>(key);

				expect(localStorageSignal()).toEqual(testValue);
			});
		});

		/**
		 * Demonstrates how parse can be used as validation
		 */
		it('should handle validation correctly', () => {
			TestBed.runInInjectionContext(() => {
				const invalidValue = 'invalid';
				const parse = () => {
					throw new Error('Invalid value');
				};
				localStorage.setItem(key, JSON.stringify(invalidValue));

				const localStorageSignal = injectLocalStorage<string>(key, { parse });

				expect(localStorageSignal()).toBeUndefined();
			});
		});

		it('should set signal value to undefined if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				localStorage.setItem(key, 'not a valid json');

				const localStorageSignal = injectLocalStorage<string>(key);

				expect(localStorageSignal()).toBeUndefined();
			});
		});

		/* TODO If we choose to emit and error instead of setting the value to undefined

		it('should emit an error if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<string>(key);
				expect(error()).toBeInstanceOf(Error);
			});
		});
		*/

		it('should react to external localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = 'old value';
				const newValue = 'new value';
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal = injectLocalStorage<string>(key);

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key,
						newValue: JSON.stringify(newValue),
					}),
				);

				expect(localStorageSignal()).toEqual(newValue);
			});
		});

		it('should not react to external localStorage changes with other key', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = 'old value';
				const newValue = 'new value';
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal = injectLocalStorage<string>(key);

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key: 'other key',
						newValue: JSON.stringify(newValue),
					}),
				);

				expect(localStorageSignal()).toEqual(oldValue);
			});
		});

		it('should not react to external sessionStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = 'old value';
				const newValue = 'new value';
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal = injectLocalStorage<string>(key);

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: sessionStorage,
						key,
						newValue: JSON.stringify(newValue),
					}),
				);

				expect(localStorageSignal()).toEqual(oldValue);
			});
		});

		it('should dispatch localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = 'old value';
				const newValue1 = 'new value 1';
				const newValue2 = 'new value 2';
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal1 = injectLocalStorage<string>(key);
				const localStorageSignal2 = injectLocalStorage<string>(key);

				localStorageSignal1.set(newValue1);

				expect(localStorageSignal2()).toEqual(newValue1);

				localStorageSignal1.update((value) => {
					expect(value).toBe(newValue1);

					return newValue2;
				});

				expect(localStorageSignal2()).toEqual(newValue2);
			});
		});

		it('should not register producers on consumer in reactive context when updating signal', async () => {
			await TestBed.runInInjectionContext(async () => {
				const oldValue = 'old value';
				const newValue1 = 'new value 1';
				const newValue2 = 'new value 2';
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal = injectLocalStorage<string>(key);

				const effectConsumer = await new Promise<ReactiveNode | null>(
					(resolve) => {
						const effectRef = effect(
							() => {
								localStorageSignal.set(newValue1);
								localStorageSignal.update(() => newValue2);

								resolve(getActiveConsumer());

								effectRef.destroy();
							},
							{
								allowSignalWrites: true,
							},
						);

						TestBed.flushEffects();
					},
				);

				expect(effectConsumer?.producerNode?.length).toBeFalsy();
			});
		});
	});

	describe('with object', () => {
		it('should set a value in localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = { house: { rooms: 3, bathrooms: 2 } };
				const localStorageSignal = injectLocalStorage<typeof testValue>(key);

				localStorageSignal.set(testValue);

				expect(localStorage.getItem(key)).toEqual(JSON.stringify(testValue));
			});
		});

		it('should get the current value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = { house: { rooms: 3, bathrooms: 2 } };
				localStorage.setItem(key, JSON.stringify(testValue));

				const localStorageSignal = injectLocalStorage<typeof testValue>(key);

				expect(localStorageSignal()).toEqual(testValue);
			});
		});

		it('should handle validation correctly', () => {
			TestBed.runInInjectionContext(() => {
				const invalidValue = { house: { rooms: 3, bathrooms: 2 } };
				const parse = () => {
					throw new Error('Invalid value');
				};
				localStorage.setItem(key, JSON.stringify(invalidValue));

				const localStorageSignal = injectLocalStorage<typeof invalidValue>(
					key,
					{ parse },
				);

				expect(localStorageSignal()).toBeUndefined();
			});
		});

		it('should set signal value to undefined if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				localStorage.setItem(key, 'not a valid json');

				const localStorageSignal = injectLocalStorage<string>(key);
				expect(localStorageSignal()).toBeUndefined();
			});
		});

		/* TODO If we choose to emit and error instead of setting the value to undefined

				it('should emit an error if JSON parsing fails', () => {
					TestBed.runInInjectionContext(() => {
						getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

						const { error } = injectLocalStorage<string>(key);
						expect(error()).toBeInstanceOf(Error);
					});
				});
				*/

		it('should react to external localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = { house: { rooms: 3, bathrooms: 2 } };
				const newValue = { house: { rooms: 4, bathrooms: 2 } };
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal = injectLocalStorage<typeof newValue>(key);

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key,
						newValue: JSON.stringify(newValue),
					}),
				);

				expect(localStorageSignal()).toEqual(newValue);
			});
		});

		it('should react to multiple localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const val1 = { house: { rooms: 3, bathrooms: 2 } };
				localStorage.setItem(key, JSON.stringify(val1));

				const localStorageSignal = injectLocalStorage<typeof val1>(key);

				expect(localStorageSignal()).toEqual(val1);

				const val2 = { house: { rooms: 4, bathrooms: 2 } };
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key,
						newValue: JSON.stringify(val2),
					}),
				);
				expect(localStorageSignal()).toEqual(val2);

				const val3 = { house: { rooms: 5, bathrooms: 2 } };
				localStorageSignal.set(val3);
				expect(localStorageSignal()).toEqual(val3);
				expect(localStorage.getItem(key)).toBe(JSON.stringify(val3));
			});
		});

		it('should dispatch localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = { house: { rooms: 3, bathrooms: 2 } };
				const newValue = { house: { rooms: 4, bathrooms: 2 } };
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal1 = injectLocalStorage<typeof newValue>(key);
				const localStorageSignal2 = injectLocalStorage<typeof newValue>(key);

				localStorageSignal1.set(newValue);

				expect(localStorageSignal2()).toEqual(newValue);
			});
		});
	});
});
