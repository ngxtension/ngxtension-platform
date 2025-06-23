import { signal, WritableSignal } from '@angular/core';
import { injectLocalStorage } from './inject-local-storage';

describe('injectLocalStorage', () => {
	const key = 'testKey';

	afterEach(() => {
		localStorage.clear();
	});

	describe('with primitive', () => {
		it.injectable('should set a value in localStorage', () => {
			const localStorageSignal = injectLocalStorage<string>(key);
			const testValue = 'value';

			localStorageSignal.set(testValue);

			expect(localStorage.getItem(key)).toEqual(JSON.stringify(testValue));
		});

		it.injectable('should get a undefined value from localStorage', () => {
			const localStorageSignal = injectLocalStorage<string>(key);

			expect(localStorageSignal()).toBeUndefined();
		});

		it.injectable('should return defaultValue of type string', () => {
			const defaultValue = 'default';
			const localStorageSignal = injectLocalStorage<string>(key, {
				defaultValue,
			});

			expect(localStorageSignal()).toEqual(defaultValue);
		});

		it.injectable('should get the current value from localStorage', () => {
			const testValue = 'value';
			localStorage.setItem(key, JSON.stringify(testValue));

			const localStorageSignal = injectLocalStorage<string>(key);

			expect(localStorageSignal()).toEqual(testValue);
		});

		/**
		 * Demonstrates how parse can be used as validation
		 */
		it.injectable('should handle validation correctly', () => {
			const invalidValue = 'invalid';
			const parse = () => {
				throw new Error('Invalid value');
			};
			localStorage.setItem(key, JSON.stringify(invalidValue));

			const localStorageSignal = injectLocalStorage<string>(key, { parse });

			expect(localStorageSignal()).toBeUndefined();
		});

		it.injectable(
			'should set signal value to undefined if JSON parsing fails',
			() => {
				localStorage.setItem(key, 'not a valid json');

				const localStorageSignal = injectLocalStorage<string>(key);

				expect(localStorageSignal()).toBeUndefined();
			},
		);

		/* TODO If we choose to emit and error instead of setting the value to undefined

		it.injectable('should emit an error if JSON parsing fails', () => {
				getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<string>(key);
				expect(error()).toBeInstanceOf(Error);
		});
		*/

		it.injectable('should react to external localStorage changes', () => {
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

		it.injectable(
			'should not react to external localStorage changes with other key',
			() => {
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
			},
		);

		it.injectable('should not react to external sessionStorage changes', () => {
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

		it.injectable('should dispatch localStorage changes', () => {
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

		it.injectable(
			'should not register producers on consumer in reactive context when updating signal',
			() => {
				const oldValue = 'old value';
				const newValue1 = 'new value 1';
				const newValue2 = 'new value 2';
				localStorage.setItem(key, JSON.stringify(oldValue));

				const localStorageSignal = injectLocalStorage<string>(key);

				expect(() => {
					localStorageSignal.set(newValue1);
					localStorageSignal.update(() => newValue2);
				}).toBeReactivePure();
			},
		);
	});

	describe('with object', () => {
		it.injectable('should set a value in localStorage', () => {
			const testValue = { house: { rooms: 3, bathrooms: 2 } };
			const localStorageSignal = injectLocalStorage<typeof testValue>(key);

			localStorageSignal.set(testValue);

			expect(localStorage.getItem(key)).toEqual(JSON.stringify(testValue));
		});

		it.injectable('should get the current value from localStorage', () => {
			const testValue = { house: { rooms: 3, bathrooms: 2 } };
			localStorage.setItem(key, JSON.stringify(testValue));

			const localStorageSignal = injectLocalStorage<typeof testValue>(key);

			expect(localStorageSignal()).toEqual(testValue);
		});

		it.injectable('should handle validation correctly', () => {
			const invalidValue = { house: { rooms: 3, bathrooms: 2 } };
			const parse = () => {
				throw new Error('Invalid value');
			};
			localStorage.setItem(key, JSON.stringify(invalidValue));

			const localStorageSignal = injectLocalStorage<typeof invalidValue>(key, {
				parse,
			});

			expect(localStorageSignal()).toBeUndefined();
		});

		it.injectable(
			'should set signal value to undefined if JSON parsing fails',
			() => {
				localStorage.setItem(key, 'not a valid json');

				const localStorageSignal = injectLocalStorage<string>(key);
				expect(localStorageSignal()).toBeUndefined();
			},
		);

		/* TODO If we choose to emit and error instead of setting the value to undefined

				it.injectable('should emit an error if JSON parsing fails', () => {
						getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

						const { error } = injectLocalStorage<string>(key);
						expect(error()).toBeInstanceOf(Error);
				});
				*/

		it.injectable('should react to external localStorage changes', () => {
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

		it.injectable('should react to multiple localStorage changes', () => {
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

		it.injectable('should dispatch localStorage changes', () => {
			const oldValue = { house: { rooms: 3, bathrooms: 2 } };
			const newValue = { house: { rooms: 4, bathrooms: 2 } };
			localStorage.setItem(key, JSON.stringify(oldValue));

			const localStorageSignal1 = injectLocalStorage<typeof newValue>(key);
			const localStorageSignal2 = injectLocalStorage<typeof newValue>(key);

			localStorageSignal1.set(newValue);

			expect(localStorageSignal2()).toEqual(newValue);
		});

		it.injectable(
			'should be reactive pure if signals reads in stringify function',
			() => {
				const config = signal({ maxLength: 10 });
				const value = injectLocalStorage<string[]>('test', {
					stringify: (items) =>
						// @ts-expect-error https://github.com/ngxtension/ngxtension-platform/pull/596
						JSON.stringify(items.slice(0, config().maxLength)),
					defaultValue: [],
				});

				expect(() => {
					value.set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']);
					value.update((items) => [...items, 'l']);
				}).toBeReactivePure();
			},
		);
	});

	describe('with computed key', () => {
		let key: WritableSignal<string>;

		beforeEach(() => {
			key = signal('testKey');
		});

		it.injectable('should set a value in localStorage', () => {
			const localStorageSignal = injectLocalStorage<string>(key);
			localStorageSignal.set('value');
			expect(localStorage.getItem('testKey')).toEqual(JSON.stringify('value'));

			key.set('testKey2');
			localStorageSignal.set('value2');
			expect(localStorage.getItem('testKey2')).toEqual(
				JSON.stringify('value2'),
			);
		});

		it.injectable('should get the current value from localStorage', () => {
			localStorage.setItem('testKey', JSON.stringify('value'));
			localStorage.setItem('testKey2', JSON.stringify('value2'));

			const localStorageSignal = injectLocalStorage<string>(key);
			expect(localStorageSignal()).toEqual('value');

			key.set('testKey2');
			expect(localStorageSignal()).toEqual('value2');
		});

		it.injectable('should react to external localStorage changes', () => {
			localStorage.setItem('testKey', JSON.stringify('value'));
			localStorage.setItem('testKey2', JSON.stringify('value2'));

			const localStorageSignal = injectLocalStorage<string>(key);

			// Simulate an external change
			window.dispatchEvent(
				new StorageEvent('storage', {
					storageArea: localStorage,
					key: 'testKey',
					newValue: JSON.stringify('newValue'),
				}),
			);

			expect(localStorageSignal()).toEqual('newValue');

			key.set('testKey2');

			// Simulate an external change
			window.dispatchEvent(
				new StorageEvent('storage', {
					storageArea: localStorage,
					key: 'testKey2',
					newValue: JSON.stringify('newValue2'),
				}),
			);

			expect(localStorageSignal()).toEqual('newValue2');
		});

		it.injectable(
			'should not react to external localStorage changes with other key',
			() => {
				localStorage.setItem('testKey', JSON.stringify('value'));
				localStorage.setItem('testKey2', JSON.stringify('value2'));

				const localStorageSignal = injectLocalStorage<string>(key);

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key: 'other key',
						newValue: JSON.stringify('newValue'),
					}),
				);

				expect(localStorageSignal()).toEqual('value');

				key.set('testKey2');

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key: 'other key',
						newValue: JSON.stringify('newValue'),
					}),
				);

				expect(localStorageSignal()).toEqual('value2');
			},
		);

		it.injectable('should dispatch localStorage changes', () => {
			localStorage.setItem('testKey', JSON.stringify('value'));
			localStorage.setItem('testKey2', JSON.stringify('value2'));

			const localStorageSignal1 = injectLocalStorage<string>(key);
			const localStorageSignal2 = injectLocalStorage<string>(key);

			localStorageSignal1.set('newValue');
			expect(localStorageSignal2()).toEqual('newValue');

			key.set('testKey2');
			localStorageSignal1.set('newValue2');
			expect(localStorageSignal2()).toEqual('newValue2');
		});

		it.injectable(
			'should not register producers on consumer in reactive context when updating signal',
			() => {
				localStorage.setItem('testKey', JSON.stringify('value'));
				localStorage.setItem('testKey2', JSON.stringify('value2'));

				const localStorageSignal = injectLocalStorage<string>(key);

				expect(() => {
					localStorageSignal.set('newValue');
					localStorageSignal.update(() => 'newValue1');
				}).toBeReactivePure();

				key.set('testKey2');

				expect(() => {
					localStorageSignal.set('newValue2');
					localStorageSignal.update(() => 'newValue3');
				}).toBeReactivePure();
			},
		);

		it.injectable(
			'should remove old key when clearOnKeyChange is true (default)',
			() => {
				key = signal('k1');
				localStorage.setItem('k1', JSON.stringify('v1'));

				const localStorageSignal = injectLocalStorage<string>(key);

				expect(localStorageSignal()).toBe('v1');

				key.set('k2');

				// should preserve value until next read
				expect(localStorage.getItem('k1')).toEqual(JSON.stringify('v1'));

				expect(localStorageSignal()).toBeUndefined();

				expect(localStorage.getItem('k1')).toBeNull();
				expect(localStorage.getItem('k2')).toBeNull();

				localStorageSignal.set('v2');
				expect(localStorage.getItem('k2')).toEqual(JSON.stringify('v2'));
			},
		);

		it.injectable('should keep old key when clearOnKeyChange is false', () => {
			key = signal('k1');
			localStorage.setItem('k1', JSON.stringify('v1'));

			injectLocalStorage<string>(key, { clearOnKeyChange: false });

			key.set('k2');

			expect(localStorage.getItem('k1')).toEqual(JSON.stringify('v1'));
		});
	});
});
