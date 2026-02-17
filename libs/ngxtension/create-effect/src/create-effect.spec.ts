import 'zone.js/testing';
import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY, Subject, interval, of, switchMap, tap, throwError, isObservable } from 'rxjs';
import { createEffect } from './create-effect';

describe(createEffect.name, () => {
  let effect: ReturnType<typeof createEffect<string>>;
  let lastResult: string | undefined;
  let lastError: string | undefined;
  let handlerCalls = 0;


  beforeEach(() => {
    lastResult = undefined;
    handlerCalls = 0;

    TestBed.runInInjectionContext(() => {
      effect = createEffect<string>((_, callbacks) => _.pipe(
        tap((r) => {
          lastResult = r;
          handlerCalls++;
        }),
        switchMap((v) => {
          if (v.startsWith('error')) {
            lastError = v;
            callbacks.error('error:' + v);
            return throwError(() => 'err');
          }
          lastError = undefined;
          callbacks.success('success:' + v);
          return of(v);
        }),
      ));
    });
  })

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

  // TODO: uncomment when https://github.com/ngxtension/ngxtension-platform/issues/599 is resolved.
	// it('should run until component is destroyed', fakeAsync(() => {
	// 	const fixture = TestBed.createComponent(Foo);
	// 	const component = fixture.componentInstance;
	// 	fixture.detectChanges();
	// 	expect(component.count).toEqual(0);
  //
	// 	tick(1000);
	// 	expect(component.count).toEqual(1);
  //
	// 	tick(1000);
	// 	expect(component.count).toEqual(2);
  //
	// 	fixture.destroy();
	// 	tick(1000);
	// 	expect(component.count).toEqual(2);
	// }));

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
    // s has error and will not accept emissions anymore.
    // {retryOnError} in effect's config should only affect
    // the effect's event loop, not the observable that is
    // passed as a value - resubscribing to that observable
    // might cause unexpected behavior.
    expect(lastResult).toEqual('a');

    // but the effect's event loop should still work
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

  it('should return an observable when getEffectFor() is called', () => {
    const e = effect.asObservable('test');
    expect(isObservable(e)).toEqual(true);
    e.subscribe();
    expect(lastResult).toEqual('test');
  });

  it('should run callbacks', () => {
    let r = '';
    let f = '';
    effect('s', {
      onSuccess: (v) => r = v as string,
      onFinalize: () => f = 'finalized:success',
    });
    expect(r).toEqual('success:s');
    expect(f).toEqual('finalized:success');

    f = '';
    effect('error1', {
      onError: (v) => r = v as string,
      onFinalize: () => f = 'finalized:error',
    });
    expect(r).toEqual('error:error1');
    expect(f).toEqual('finalized:error');
  });

  it('should emit the initial value when a signal is passed', () => {
    expect(handlerCalls).toEqual(0);
    effect(signal('test'));
    expect(lastResult).toEqual('test');
    expect(handlerCalls).toEqual(1);
    TestBed.flushEffects();
    expect(handlerCalls).toEqual(1);
  });

  it('should emit the new value of a signal if it is different from the initial value', () => {
    expect(handlerCalls).toEqual(0);
    const s = signal('test');
    effect(s);
    expect(lastResult).toEqual('test');
    expect(handlerCalls).toEqual(1);
    s.set('test2');
    TestBed.flushEffects();
    expect(lastResult).toEqual('test2');
    expect(handlerCalls).toEqual(2);
  });

  it('should skip the new value of a signal if it is equal to the initial value', () => {
    expect(handlerCalls).toEqual(0);
    const s = signal('test');
    effect(s);
    expect(lastResult).toEqual('test');
    expect(handlerCalls).toEqual(1);
    s.set('test');
    TestBed.flushEffects();
    expect(lastResult).toEqual('test');
    expect(handlerCalls).toEqual(1);
  });

  it('should NOT emit the initial value when a required input without initial value is passed', () => {
    expect(handlerCalls).toEqual(0);
    TestBed.runInInjectionContext(() => {
      effect(input.required());
      expect(lastResult).not.toEqual('test');
      expect(handlerCalls).toEqual(0);
      TestBed.flushEffects();
      expect(handlerCalls).toEqual(0);
    });
  });

  it('should accept Promise as value', async () => {
    expect(handlerCalls).toEqual(0);
    effect(Promise.resolve('test'));
    expect(lastResult).toEqual(undefined);
    expect(handlerCalls).toEqual(0);
    await Promise.resolve();
    expect(lastResult).toEqual('test');
    expect(handlerCalls).toEqual(1);
  });
});
