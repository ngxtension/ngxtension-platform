import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
	const key = 'testKey';
	let setItemSpy: jest.SpyInstance;
	let getItemSpy: jest.SpyInstance;
	let storageEventSubject: Subject<Event>;

	beforeEach(() => {
		storageEventSubject = new Subject<Event>();
		setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
		getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null); // Default mock to return null
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('with primitive', () => {
		it('should set a value in localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const { set } = useLocalStorage<string>(key);
				const testValue = 'value';
				set(testValue);
				expect(setItemSpy).toHaveBeenCalledWith(key, JSON.stringify(testValue));
			});
		});

		it('should get the current value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = 'value';
				getItemSpy.mockReturnValue(JSON.stringify(testValue)); // Mock return value for getItem

				const { value } = useLocalStorage<string>(key);

				expect(value()).toEqual(testValue);
			});
		});

		it('should handle validation correctly', () => {
			TestBed.runInInjectionContext(() => {
				const invalidValue = 'invalid';
				const validate = (value: unknown) => value === 'valid';
				getItemSpy.mockReturnValue(JSON.stringify(invalidValue)); // Mock return value for getItem

				const { value } = useLocalStorage<string>(key, validate);

				expect(value()).toBeNull;
			});
		});

		it('should emit an error if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

				const { error } = useLocalStorage<string>(key);
				expect(error()).toBeInstanceOf(Error);
			});
		});

		it('should react to external localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const newValue = 'new value';
				getItemSpy.mockReturnValue(JSON.stringify(newValue)); // Mock return value for getItem after change

				const { value } = useLocalStorage<string>(key);

				// Simulate an external change
				storageEventSubject.next(new Event('storage'));

				expect(value()).toEqual(newValue);
			});
		});
	});

	describe('with object', () => {
		it('should set a value in localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = { house: { rooms: 3, bathrooms: 2 } };
				const { set } = useLocalStorage<typeof testValue>(key);
				set(testValue);
				expect(setItemSpy).toHaveBeenCalledWith(key, JSON.stringify(testValue));
			});
		});

		it('should get the current value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = { house: { rooms: 3, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(testValue)); // Mock return value for getItem

				const { value } = useLocalStorage<typeof testValue>(key);

				expect(value()).toEqual(testValue);
			});
		});

		it('should handle validation correctly', () => {
			TestBed.runInInjectionContext(() => {
				const invalidValue = { house: { rooms: 3, bathrooms: 2 } };
				const validate = (value: unknown) => value === 'valid';
				getItemSpy.mockReturnValue(JSON.stringify(invalidValue)); // Mock return value for getItem

				const { value } = useLocalStorage<typeof invalidValue>(key, validate);

				expect(value()).toBeNull;
			});
		});

		it('should emit an error if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

				const { error } = useLocalStorage<string>(key);
				expect(error()).toBeInstanceOf(Error);
			});
		});

		it('should react to external localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const newValue = { house: { rooms: 3, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(newValue)); // Mock return value for getItem after change

				const { value } = useLocalStorage<typeof newValue>(key);

				// Simulate an external change
				storageEventSubject.next(new Event('storage'));

				expect(value()).toEqual(newValue);
			});
		});

		it('should react to multiple localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const val1 = { house: { rooms: 3, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(val1));

				const { set, value } = useLocalStorage<typeof val1>(key);

				// Simulate an external change
				storageEventSubject.next(new Event('storage'));
				expect(value()).toEqual(val1);

				const val2 = { house: { rooms: 3, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(val2)); // Mock return value for getItem
				storageEventSubject.next(new Event('storage'));
				expect(value()).toEqual(val2);

				const val3 = { house: { rooms: 3, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(val3)); // Mock return value for getItem
				set(val3);
				expect(value()).toEqual(val2);
			});
		});
	});
});
