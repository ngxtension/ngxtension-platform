import { map } from 'rxjs';

export const filterArray = <T>(filterFn: (item: T) => boolean) => {
	return map((array: T[]) => array.filter((item) => filterFn(item)));
};
