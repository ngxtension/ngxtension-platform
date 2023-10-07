import { from } from 'rxjs';
import { mapFilter } from './mapfilter';

describe(mapFilter.name, () => {
	it('given an observable >1-42-3| and a mapping function that double ONLY the odds value, then result is an observable of >"2"--"6"-| the intial even value (42) is not mapped and so filtered out', () => {
		const in$ = from([1, 42, 3]);
		const out$ = in$.pipe(
			mapFilter((n) => {
				if (n % 2) return String(n * 2);
				else return undefined; // explict return undefined to skipout (filter) some value from the out observable
			})
		);

		let out = '>';
		out$.subscribe((s) => {
			//s is a string
			out += s + '-';
		});
		out += '|';
		expect(out).toEqual('>2-6-|');
	});

	it('given a trasform function that always emit values (ex: v => v+42), all value in are "mapped" out: Observable >1-2-3-| -> >43-44-45-| same as map', () => {
		const in$ = from([1, 2, 3]);
		const out$ = in$.pipe(mapFilter((n) => [n + 42]));
		//else return undefined // <-- this is the same as not returning anything! In either case the value is filtered out
		let out = '>';
		out$.subscribe((a) => {
			//a is an array of number
			out += JSON.stringify(a) + '-';
		});
		out += '|';
		expect(out).toEqual('>[43]-[44]-[45]-|');
	});

	it('given a trasform function that explicit return undefined or does not return a value for same code path it filter out those value from the out observable', () => {
		const in$ = from([1, 2, 3, 4, 5, 6, 7]);
		const doubleNotMultipleOf2Or3$ = in$.pipe(
			//@ts-ignore -- I USE THIS BECOUSE I WANT A TRANSFORM FUNCTION THAT DOES NOT RETURN SOMETHING FOR SOME CODE PATH (even numbers)
			mapFilter((n) => {
				if (n % 2) {
					if (n % 3) return n * 2;
					else return undefined;
				}
				//else return undefined // <-- this is the same as not returning anything! In either case the value is filtered out
			})
		);

		let out = '>';
		doubleNotMultipleOf2Or3$.subscribe((r) => {
			//r is a number
			out += r.toFixed(1) + '-';
		});
		out += '|';
		expect(out).toEqual('>2.0-10.0-14.0-|');
	});
});
