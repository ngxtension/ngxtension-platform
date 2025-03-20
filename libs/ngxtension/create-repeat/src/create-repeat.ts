import { assertInInjectionContext, DestroyRef, inject } from '@angular/core';
import { repeat, Subject, type MonoTypeOperatorFunction } from 'rxjs';

type CreateRepeat = (<T>(count?: number) => MonoTypeOperatorFunction<T>) & {
	emit: () => void;
};

export function createRepeat(destroyRef?: DestroyRef): CreateRepeat;
export function createRepeat(
	generalCount?: number,
	destroyRef?: DestroyRef,
): CreateRepeat;
export function createRepeat(
	generalCountOrDestroyRef?: number | DestroyRef,
	destroyRef?: DestroyRef,
) {
	const [generalCount, _destroyRef] = parseArgs(
		generalCountOrDestroyRef,
		destroyRef,
	);

	const repeat$ = new Subject<void>();

	_destroyRef.onDestroy(() => repeat$.complete());

	const repeatFn = <T>(count?: number) =>
		repeat<T>({ count: count ?? generalCount, delay: () => repeat$ });

	repeatFn.emit = () => repeat$.next();

	return repeatFn;
}

function parseArgs(
	generalCountOrDestroyRef?: number | DestroyRef,
	destroyRef?: DestroyRef,
) {
	const isGeneralCount = typeof generalCountOrDestroyRef === 'number';

	const generalCount = isGeneralCount ? generalCountOrDestroyRef : undefined;

	destroyRef ??= !isGeneralCount ? generalCountOrDestroyRef : undefined;

	if (!destroyRef) assertInInjectionContext(createRepeat);
	destroyRef ??= inject(DestroyRef);

	return [generalCount, destroyRef] as const;
}
