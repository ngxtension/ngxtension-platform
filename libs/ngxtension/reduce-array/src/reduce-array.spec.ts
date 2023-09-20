import { of } from 'rxjs';
import { reduceArray } from './reduce-array';

describe(reduceArray.name, () => {
	const dummyObs = of([1, 2, 3]);

	it('given an observable of [1,2,3] and a reducing function of summing elements, then result is an observable of 6', (done) => {
		const result = dummyObs.pipe(reduceArray((acc, n) => acc + n, 0));

		result.subscribe((r) => {
			expect(r).toEqual(6);
			done();
		});
	});

	it('given an observable of [1,2,3] and a reducing function of summing elements with index, then result is an observable of 9', (done) => {
		const resultWithIndex = dummyObs.pipe(
			reduceArray((acc, n, i) => acc + n + i, 0)
		);

		resultWithIndex.subscribe((rI) => {
			expect(rI).toEqual(9);
			done();
		});
	});
});
