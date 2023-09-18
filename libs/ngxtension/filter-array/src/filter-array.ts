import { map } from 'rxjs';

export const filterArray = <T>(filterFn: (item: T, index: number) => boolean) =>
	map((array: T[]) => array.filter((item, index) => filterFn(item, index)));
