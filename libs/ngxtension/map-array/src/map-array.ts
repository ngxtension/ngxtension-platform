import { map } from 'rxjs';

export const mapArray = <T, R>(mapFn: (item: T, index: number) => R) =>
	map((array: T[]) => array.map((item, index) => mapFn(item, index)));
