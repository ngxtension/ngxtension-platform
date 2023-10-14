import { from, of, toArray } from 'rxjs';
import { filterUndefined, mapSkipUndefined } from './map-skip-undefined';

describe(filterUndefined.name, () => {
	it('given an observable of null, undefined, 42, filter out the undefined, emit null and 42', (done) => {
		const in$ = of(null, undefined, 42);
		const out$ = in$.pipe(filterUndefined());

		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([null, 42]);
			done();
		});
	});
});

describe(mapSkipUndefined.name, () => {
	it('given an observable >1-42-3| and a mapping function that double ONLY the odds value, then result is an observable of >"2"--"6"-| the intial even value (42) is not mapped and so filtered out', (done) => {
		const in$ = from([1, 42, 3]);
		const out$ = in$.pipe(
			mapSkipUndefined((n) => {
				if (n % 2) return String(n * 2);
				else return undefined; // explict return undefined to skipout (filter) some value from the out observable
			})
		);

		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual(['2', '6']);
			done();
		});
	});

	it('given a trasform function that always emit values (ex: v => v+42), all value in are "mapped" out: Observable >1-2-3-| -> >43-44-45-| same as map', (done) => {
		const in$ = from([1, 2, 3]);
		const out$ = in$.pipe(mapSkipUndefined((n) => n + 42));
		out$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([43, 44, 45]);
			done();
		});
	});

	it('given a trasform function that explicit return undefined or does not return a value for same code path it filter out those value from the out observable', (done) => {
		const in$ = from([1, 2, 3, 4, 5, 6, 7]);
		const doubleNotMultipleOf2Or3$ = in$.pipe(
			mapSkipUndefined((n) => {
				if (n % 2) {
					if (n % 3) return n * 2;
					else return undefined;
				}
				//else return undefined // <-- this is the same as not returning anything! In either case the value is filtered out
			})
		);

		doubleNotMultipleOf2Or3$.pipe(toArray()).subscribe((r) => {
			expect(r).toEqual([2, 10, 14]);
			done();
		});
	});
});
