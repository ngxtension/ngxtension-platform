import { type Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const filterUndefined = <T>() =>
	filter((value: T): value is Exclude<T, undefined> => value !== undefined);

export function mapSkipUndefined<T, R>(
	fnTrasformSkipUndefined: (value: T) => R
) {
	return function (source: Observable<T>) {
		return source.pipe(map(fnTrasformSkipUndefined), filterUndefined());
	};
}
