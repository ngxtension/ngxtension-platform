import { of } from 'rxjs';
import { filterNil } from './filter-nil';

describe(filterNil.name, () => {
	it('given an observable of undefined, null, 1, then only value 1 is expected', (done) => {
		const dummyObs = of(undefined, null, 1);
		const result = dummyObs.pipe(filterNil());

		result.subscribe((r) => {
			expect(r).toEqual(1);
			done();
		});
	});
});
