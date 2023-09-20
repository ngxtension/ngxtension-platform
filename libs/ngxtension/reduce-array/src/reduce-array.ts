import { map } from 'rxjs';

export const reduceArray = <T, R>(
	reduceFn: (accumulator: R, item: T, index: number) => R,
	initialValue: R
) =>
	map((array: T[]) =>
		array.reduce((acc, item, index) => reduceFn(acc, item, index), initialValue)
	);
