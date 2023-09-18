import { combineLatest, of } from 'rxjs';
import { mapArray } from './map-array';

describe(mapArray.name, () => {
	const dummyObs = of([1, 2, 3]);

	it('given an observable of [1,2,3] and a mapping function of adding 1 to each element, then result is an observable of [2,3,4], [2, 4, 6] with index', (done) => {
		const result = dummyObs.pipe(mapArray((n) => n + 1));
		const resultWithIndex = dummyObs.pipe(mapArray((n, i) => n + 1 + i));

		combineLatest([result, resultWithIndex]).subscribe(([r, rI]) => {
			expect(r).toEqual([2, 3, 4]);
			expect(rI).toEqual([2, 4, 6]);
			done();
		});
	});
});
