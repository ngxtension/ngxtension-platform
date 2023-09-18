import { of } from 'rxjs';
import { filterArray } from './filter-array';

describe(filterArray.name, () => {
	const dummyObs = of([1, 2, 3]);

	it('given an observable of [1,2,3] and a function filtering each element above 2, then result is an observable of [1,2]', (done) => {
		const result = dummyObs.pipe(filterArray((n) => n <= 2));

		result.subscribe((r) => {
			expect(r).toEqual([1, 2]);
			done();
		});
	});
});
