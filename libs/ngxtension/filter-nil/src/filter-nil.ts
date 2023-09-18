import { filter } from 'rxjs';

export const filterNil = <T>() =>
	filter(
		(value: T): value is NonNullable<T> => value !== undefined && value !== null
	);
