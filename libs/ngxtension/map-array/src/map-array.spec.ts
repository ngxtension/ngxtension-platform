import { of } from 'rxjs';
import { mapArray } from './map-array';

describe(mapArray.name, () => {
	const dummyObs = of([1, 2, 3]);

	it('given an observable of [1,2,3] and a mapping function of adding 1 to each element, then result is an observable of [2,3,4]', (done) => {
		const result = dummyObs.pipe(mapArray((n) => n + 1));

		result.subscribe((r) => {
			expect(r).toEqual([2, 3, 4]);
			done();
		});
	});
});
