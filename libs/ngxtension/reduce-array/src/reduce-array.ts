import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function reduceArray<T, R = T>(
	reduceFn: (acc: R, item: T, index: number) => R,
	initialValue?: R
): (source: Observable<T[]>) => Observable<R> {
	return map((array: T[]) => {
		// call reduce function with initialValue
		if (initialValue !== undefined) {
			return array.reduce(reduceFn, initialValue);
		}
		// no initialValue
		else {
			// Javascript throws error if array is empty: [].reduce((acc,n) => acc +n)
			// avoid errors and return undefined
			if (!array.length) {
				return undefined;
			}
			// if array is not empty, call the reduceFn without initialValue
			return (array as any).reduce(reduceFn);
		}
	});
}
