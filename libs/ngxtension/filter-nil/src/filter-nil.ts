import { filter } from 'rxjs';

// TypeScript's built-in `NonNullable` doesn't distribute properly over generic type parameters
// in type predicate contexts, causing the type guard to fail. This custom conditional type
// forces distribution by being evaluated directly in the generic context.
type NotNullable<T> = T extends null | undefined ? never : T;

export const filterNil = <T>() =>
	filter(
		(value: T): value is NotNullable<T> =>
			value !== undefined && value !== null,
	);
