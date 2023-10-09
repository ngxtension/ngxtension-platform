import { type Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export function mapFilter<T, R>(fnTrasformSkipUndefined: (value: T) => R) {
	return function (source: Observable<T>): Observable<Exclude<R, undefined>> {
		return source.pipe(
			map(fnTrasformSkipUndefined),
			filter((value) => value !== undefined)
		) as Observable<Exclude<R, undefined>>;
	};
}
