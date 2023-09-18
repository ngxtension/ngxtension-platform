import { map } from 'rxjs';

export const mapArray = <T, R>(mapFn: (item: T) => R) => {
	return map((array: T[]) => array.map((item) => mapFn(item)));
};
