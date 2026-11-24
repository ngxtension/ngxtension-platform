import { of, timer } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { deriveLoading } from './derive-loading';

describe(deriveLoading.name, () => {
	describe('For sync observable', () => {
		it('should return false', (done) => {
			const source$ = of(1).pipe(deriveLoading());

			source$.subscribe((result) => {
				expect(result).toBe(false);
				done();
			});
		});
	});

	describe('For async observable', () => {
		let testScheduler: TestScheduler;

		beforeEach(() => {
			testScheduler = new TestScheduler((actual, expected) => {
				expect(actual).toEqual(expected);
			});
		});

		it('should emit false when source emits before threshold', () => {
			testScheduler.run(({ cold, expectObservable }) => {
				const source$ = timer(1).pipe(
					deriveLoading({ threshold: 1, loadingTime: 2 }),
				);
				const expected = 'f--|';
				expectObservable(source$).toBe(expected, { f: false });
			});
		});

		// Operation takes longer than threshold
		it('should emit false-true-false when source emits after threshold', () => {
			testScheduler.run(({ cold, expectObservable }) => {
				const source$ = timer(2).pipe(
					deriveLoading({ threshold: 1, loadingTime: 2 }),
				);
				const expected = 'ft-(f|)';
				expectObservable(source$).toBe(expected, { f: false, t: true });
			});
		});

		// Operation takes longer than threshold + loadingTime
		it('should emit false-true-false when source emits after threshold + loadingTime', () => {
			testScheduler.run(({ cold, expectObservable }) => {
				const source$ = timer(4).pipe(
					deriveLoading({ threshold: 1, loadingTime: 2 }),
				);
				const expected = 'ft--(f|)';
				expectObservable(source$).toBe(expected, { f: false, t: true });
			});
		});

		describe('when the source completes without emitting', () => {
			it('should emit only false when it completes synchronously', () => {
				testScheduler.run(({ cold, expectObservable }) => {
					const source$ = cold('|').pipe(
						deriveLoading({ threshold: 1, loadingTime: 2 }),
					);
					expectObservable(source$).toBe('f--|', { f: false });
				});
			});

			it('should emit only false when it completes before threshold', () => {
				testScheduler.run(({ cold, expectObservable }) => {
					const source$ = cold('-|').pipe(
						deriveLoading({ threshold: 2, loadingTime: 2 }),
					);
					expectObservable(source$).toBe('f---|', { f: false });
				});
			});

			it('should emit false-true-false when it completes after threshold', () => {
				testScheduler.run(({ cold, expectObservable }) => {
					const source$ = cold('--|').pipe(
						deriveLoading({ threshold: 1, loadingTime: 2 }),
					);
					expectObservable(source$).toBe('ft-(f|)', { f: false, t: true });
				});
			});

			it('should emit false-true-false when it completes after threshold + loadingTime', () => {
				testScheduler.run(({ cold, expectObservable }) => {
					const source$ = cold('----|').pipe(
						deriveLoading({ threshold: 1, loadingTime: 2 }),
					);
					expectObservable(source$).toBe('ft--(f|)', {
						f: false,
						t: true,
					});
				});
			});
		});

		describe('when the source errors', () => {
			it('should not emit true when it errors before threshold', () => {
				testScheduler.run(({ cold, expectObservable }) => {
					const source$ = cold('-#', {}, 'boom').pipe(
						deriveLoading({ threshold: 2, loadingTime: 2 }),
					);
					expectObservable(source$).toBe('f---#', { f: false }, 'boom');
				});
			});

			it('should emit false before the error when it errors after threshold', () => {
				testScheduler.run(({ cold, expectObservable }) => {
					const source$ = cold('--#', {}, 'boom').pipe(
						deriveLoading({ threshold: 1, loadingTime: 2 }),
					);
					expectObservable(source$).toBe(
						'ft-(f#)',
						{ f: false, t: true },
						'boom',
					);
				});
			});

			it('should emit false before the error when it errors after threshold + loadingTime', () => {
				testScheduler.run(({ cold, expectObservable }) => {
					const source$ = cold('----#', {}, 'boom').pipe(
						deriveLoading({ threshold: 1, loadingTime: 2 }),
					);
					expectObservable(source$).toBe(
						'ft--(f#)',
						{ f: false, t: true },
						'boom',
					);
				});
			});
		});
	});
});
