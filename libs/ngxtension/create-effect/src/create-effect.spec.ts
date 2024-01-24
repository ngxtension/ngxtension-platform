import { Component, signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EMPTY, Subject, interval, of, switchMap, tap, throwError } from 'rxjs';
import { createEffect } from './create-effect';

describe(createEffect.name, () => {
	let effect: ReturnType<typeof createEffect<string>>;
	let lastResult: string | undefined;
	let lastError: string | undefined;

	beforeEach(() => {
		lastResult = undefined;

		TestBed.runInInjectionContext(() => {
			effect = createEffect<string>((_) =>
				_.pipe(
					tap((r) => (lastResult = r)),
					switchMap((v) => {
						if (v === 'error') {
							lastError = v;
							return throwError(() => 'err');
						}
						lastError = undefined;
						return of(v);
					}),
				),
			);
		});
	});

	@Component({
		standalone: true,
		template: '',
	})
	class Foo {
		count = 0;
		log = createEffect<number>(tap(() => (this.count += 1)));

		ngOnInit() {
			this.log(interval(1000));
		}
	}

	it('should run until component is destroyed', fakeAsync(() => {
		const fixture = TestBed.createComponent(Foo);
		const component = fixture.componentInstance;
		fixture.detectChanges();
		expect(component.count).toEqual(0);

		tick(1000);
		expect(component.count).toEqual(1);

		tick(1000);
		expect(component.count).toEqual(2);

		fixture.destroy();
		tick(1000);
		expect(component.count).toEqual(2);
	}));

	it('should keep working when generator throws an error', () => {
		expect(lastError).toEqual(undefined);
		effect('error');
		expect(lastResult).toEqual('error');
		expect(lastError).toEqual('error');

		effect('next');
		expect(lastResult).toEqual('next');
		expect(lastError).toEqual(undefined);
	});

	it('should keep working when value$ throws an error', () => {
		expect(lastError).toEqual(undefined);
		const s = new Subject<string>();
		const m = s.pipe(
			switchMap((v) => {
				if (v === 'error') {
					return throwError(() => 'err');
				}
				if (v === 'empty') {
					return EMPTY;
				}
				return of(v);
			}),
		);
		effect(m);
		s.next('a');
		expect(lastResult).toEqual('a');
		s.next('error');
		expect(lastResult).toEqual('a');
		s.next('b');
		expect(lastResult).toEqual('b');

		effect('next');
		expect(lastResult).toEqual('next');
		expect(lastError).toEqual(undefined);
	});

	it('should keep working when value$ emits EMPTY', () => {
		expect(lastError).toEqual(undefined);
		const s = new Subject<string>();
		const m = s.pipe(
			switchMap((v) => {
				if (v === 'error') {
					return throwError(() => 'err');
				}
				if (v === 'empty') {
					return EMPTY;
				}
				return of(v);
			}),
		);
		effect(m);
		s.next('a');
		expect(lastResult).toEqual('a');
		s.next('empty');
		expect(lastResult).toEqual('a');
		s.next('b');
		expect(lastResult).toEqual('b');

		effect('next');
		expect(lastResult).toEqual('next');
		expect(lastError).toEqual(undefined);
	});

	it('should accept signal as an argument', () => {
		const s = signal<string>('a');
		effect(s);
		TestBed.flushEffects();
		expect(lastResult).toEqual('a');
		expect(lastError).toEqual(undefined);

		s.set('b');
		TestBed.flushEffects();
		expect(lastResult).toEqual('b');
		expect(lastError).toEqual(undefined);

		s.set('error');
		s.set('not an error');
		TestBed.flushEffects();
		expect(lastResult).toEqual('not an error');
		expect(lastError).toEqual(undefined);

		s.set('not an error');
		s.set('error');
		TestBed.flushEffects();
		expect(lastError).toEqual('error');

		s.set('c');
		TestBed.flushEffects();
		expect(lastResult).toEqual('c');
		expect(lastError).toEqual(undefined);
	});
});
