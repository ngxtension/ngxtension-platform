import { TestBed } from '@angular/core/testing';
import { debounceSignal } from './debounce-signal';

describe(debounceSignal.name, () => {
	describe('data types', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
			jest.clearAllMocks();
		});

		it('number', () => {
			TestBed.runInInjectionContext(() => {
				const s = debounceSignal(1, 300);

				expect(s()).toEqual(1);
				s.set(2);
				expect(s()).toEqual(1);

				jest.advanceTimersByTime(301);
				expect(s()).toEqual(2);
			});
		});

		it('multiple changes number', () => {
			TestBed.runInInjectionContext(() => {
				const s = debounceSignal(1, 300);

				expect(s()).toEqual(1);
				s.set(2);
				s.set(3);
				s.set(4);
				expect(s()).toEqual(1);

				jest.advanceTimersByTime(301);
				expect(s()).toEqual(4);
			});
		});

		it('string', () => {
			TestBed.runInInjectionContext(() => {
				const s = debounceSignal('1', 300);

				expect(s()).toEqual('1');
				s.set('2');
				expect(s()).toEqual('1');

				jest.advanceTimersByTime(301);
				expect(s()).toEqual('2');
			});
		});

		it('multiple changes string', () => {
			TestBed.runInInjectionContext(() => {
				const s = debounceSignal('1', 300);

				expect(s()).toEqual('1');
				s.set('2');
				s.set('3');
				s.set('4');
				expect(s()).toEqual('1');

				jest.advanceTimersByTime(301);
				expect(s()).toEqual('4');
			});
		});

		it('should handle immediate updates followed by debounced updates', () => {
			TestBed.runInInjectionContext(() => {
				const s = debounceSignal(1, 300);
				expect(s()).toBe(1);

				s.set(2);
				expect(s()).toBe(1);

				jest.advanceTimersByTime(150);
				s.set(3);
				expect(s()).toBe(1);

				jest.advanceTimersByTime(151);
				expect(s()).toBe(1);

				jest.advanceTimersByTime(150);
				expect(s()).toBe(3);
			});
		});

		it('object', () => {
			TestBed.runInInjectionContext(() => {
				const initialObject = { a: 1, b: { c: 2 } };
				const s = debounceSignal(initialObject, 300);

				expect(s()).toEqual(initialObject);

				const updatedObject = { a: 2, b: { c: 3 } };
				s.set(updatedObject);
				expect(s()).toEqual(initialObject);

				jest.advanceTimersByTime(301);
				expect(s()).toEqual(updatedObject);
			});
		});

		it('array', () => {
			TestBed.runInInjectionContext(() => {
				const initialArray = [1, 2, 3];
				const s = debounceSignal(initialArray, 300);

				expect(s()).toEqual(initialArray);

				const updatedArray = [4, 5, 6];
				s.set(updatedArray);
				expect(s()).toEqual(initialArray);

				jest.advanceTimersByTime(301);
				expect(s()).toEqual(updatedArray);
			});
		});

		it('nested object property', () => {
			TestBed.runInInjectionContext(() => {
				const initialObject = { a: 1, b: { c: 2 } };
				const s = debounceSignal(initialObject, 300);

				expect(s().b.c).toEqual(2);

				s.update((val) => ({ ...val, b: { ...val.b, c: 3 } }));

				expect(s().b.c).toEqual(2);

				jest.advanceTimersByTime(301);
				expect(s().b.c).toEqual(3);
			});
		});

		it('multiple changes to nested object property', () => {
			TestBed.runInInjectionContext(() => {
				const initialObject = { a: 1, b: { c: 2 } };
				const s = debounceSignal(initialObject, 300);

				expect(s().b.c).toEqual(2);

				s.update((val) => ({ ...val, b: { ...val.b, c: 3 } }));
				s.update((val) => ({ ...val, b: { ...val.b, c: 4 } }));
				s.update((val) => ({ ...val, b: { ...val.b, c: 5 } }));

				expect(s().b.c).toEqual(2);

				jest.advanceTimersByTime(301);
				expect(s().b.c).toEqual(5);
			});
		});

		it('No support change the internal object but changes work', () => {
			TestBed.runInInjectionContext(() => {
				const initialObject = { a: 1, b: { c: 2 } };
				const s = debounceSignal(initialObject, 300);

				initialObject.b.c = 5;
				expect(s().b.c).toEqual(5);

				s.update((x) => {
					x.b.c = 100;
					return x;
				});

				expect(s().b.c).toEqual(5);

				jest.advanceTimersByTime(301);

				expect(s().b.c).toEqual(100);
			});
		});
	});
});
