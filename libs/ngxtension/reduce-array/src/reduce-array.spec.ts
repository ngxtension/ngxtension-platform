import { of } from 'rxjs';
import { reduceArray } from './reduce-array';

describe(reduceArray.name, () => {
	const input$ = of([1, 2, 3]);
	const emptyArray$ = of([]);

	it('sums elements, result is 6', (done) => {
		const result = input$.pipe(reduceArray((acc, n) => acc + n, 0));

		result.subscribe((x) => {
			expect(x).toEqual(6);
			done();
		});
	});

	it('sums elements with index, result is 9', (done) => {
		const result = input$.pipe(reduceArray((acc, n, i) => acc + n + i, 0));

		result.subscribe((x) => {
			expect(x).toEqual(9);
			done();
		});
	});

	it('no initial value, sums elements, result is 6', (done) => {
		const result = input$.pipe(reduceArray((acc, n) => acc + n));

		result.subscribe((x) => {
			expect(x).toEqual(6);
			done();
		});
	});

	it('no initial value, sums elements with index, result is 9', (done) => {
		const result = input$.pipe(reduceArray((acc, n, i) => acc + n + i));

		result.subscribe((x) => {
			expect(x).toEqual(9);
			done();
		});
	});

	it('empty array observable, with initial value 0, result is 0', (done) => {
		const result = emptyArray$.pipe(reduceArray((acc, n) => acc + n, 0));

		result.subscribe((x) => {
			expect(x).toEqual(0);
			done();
		});
	});

	it('empty array observable, no initial value, result is undefined', (done) => {
		let count = 0;
		const result = emptyArray$.pipe(
			reduceArray((_, n) => {
				count += 1;
				return n;
			})
		);
		result.subscribe((r) => {
			expect(r).toBeUndefined();
			expect(count).toEqual(0);
			done();
		});
	});
});
