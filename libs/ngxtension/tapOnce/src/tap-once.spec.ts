import { from, toArray } from 'rxjs';
import { tapOnce, tapOnceOnFirstTruthy } from './tap-once';

describe(tapOnce.name, () => {
	it('should execute the function only once at the default index 0', (done) => {
		const tapFn = jest.fn();
		const in$ = from([1, 2, 3, 4, 5]);
		const out$ = in$.pipe(tapOnce(tapFn));

		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([1, 2, 3, 4, 5]);
			expect(tapFn).toHaveBeenCalledTimes(1);
			expect(tapFn).toHaveBeenCalledWith(1);
			done();
		});
	});

	it('should execute the function only once at the specified index', (done) => {
		const tapFn = jest.fn();
		const in$ = from([1, 2, 3, 4, 5]);
		const out$ = in$.pipe(tapOnce(tapFn, 2));

		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([1, 2, 3, 4, 5]);
			expect(tapFn).toHaveBeenCalledTimes(1);
			expect(tapFn).toHaveBeenCalledWith(3);
			done();
		});
	});

	it('should throw an error if tapIndex is negative', () => {
		expect(() => tapOnce(() => void 0, -1)).toThrow(
			'tapIndex must be a non-negative integer',
		);
	});

	it('should not share state across multiple subscriptions', (done) => {
		const tapFn = jest.fn();
		const in$ = from([1, 2, 3, 4, 5]);
		const out$ = in$.pipe(tapOnce(tapFn, 1));

		// First subscription
		out$.pipe(toArray()).subscribe((r1) => {
			expect(r1).toEqual([1, 2, 3, 4, 5]);
			expect(tapFn).toHaveBeenCalledTimes(1);
			expect(tapFn).toHaveBeenCalledWith(2);

			tapFn.mockClear();

			// Second subscription - should also trigger the tap function
			out$.pipe(toArray()).subscribe((r2) => {
				expect(r2).toEqual([1, 2, 3, 4, 5]);
				expect(tapFn).toHaveBeenCalledTimes(1);
				expect(tapFn).toHaveBeenCalledWith(2);
				done();
			});
		});
	});
});

describe(tapOnceOnFirstTruthy.name, () => {
	it('should execute the function only once on the first truthy value', (done) => {
		const tapFn = jest.fn();
		const in$ = from([0, null, false, 3, 4, 5]);
		const out$ = in$.pipe(tapOnceOnFirstTruthy(tapFn));

		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([0, null, false, 3, 4, 5]);
			expect(tapFn).toHaveBeenCalledTimes(1);
			expect(tapFn).toHaveBeenCalledWith(3);
			done();
		});
	});

	it('should not execute the function if there are no truthy values', (done) => {
		const tapFn = jest.fn();
		const in$ = from([0, null, false, undefined]);
		const out$ = in$.pipe(tapOnceOnFirstTruthy(tapFn));

		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([0, null, false, undefined]);
			expect(tapFn).not.toHaveBeenCalled();
			done();
		});
	});

	it('should execute the function only once even if there are multiple truthy values', (done) => {
		const tapFn = jest.fn();
		const in$ = from([1, 2, 3, 4, 5]);
		const out$ = in$.pipe(tapOnceOnFirstTruthy(tapFn));

		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([1, 2, 3, 4, 5]);
			expect(tapFn).toHaveBeenCalledTimes(1);
			expect(tapFn).toHaveBeenCalledWith(1);
			done();
		});
	});

	it('should not share state across multiple subscriptions', (done) => {
		const tapFn = jest.fn();
		const in$ = from([0, null, false, 3, 4, 5]);
		const out$ = in$.pipe(tapOnceOnFirstTruthy(tapFn));

		// First subscription
		out$.pipe(toArray()).subscribe((r1) => {
			expect(r1).toEqual([0, null, false, 3, 4, 5]);
			expect(tapFn).toHaveBeenCalledTimes(1);
			expect(tapFn).toHaveBeenCalledWith(3);

			tapFn.mockClear();

			// Second subscription - should also trigger the tap function
			out$.pipe(toArray()).subscribe((r2) => {
				expect(r2).toEqual([0, null, false, 3, 4, 5]);
				expect(tapFn).toHaveBeenCalledTimes(1);
				expect(tapFn).toHaveBeenCalledWith(3);
				done();
			});
		});
	});
});
