import {
	Component,
	Injector,
	Input,
	OnInit,
	Signal,
	inject,
	signal,
} from '@angular/core';
import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import {
	BehaviorSubject,
	Subject,
	delay,
	filter,
	map,
	of,
	pipe,
	startWith,
	switchMap,
} from 'rxjs';
import { computedFrom } from './computed-from';

describe(computedFrom.name, () => {
	describe('works with signals', () => {
		it('value inside array', () => {
			TestBed.runInInjectionContext(() => {
				const value = signal(1);
				const s = computedFrom([value]);
				expect(s()).toEqual([1]);
			});
		});
		it('value inside object', () => {
			TestBed.runInInjectionContext(() => {
				const value = signal(1);
				const s = computedFrom({ value });
				expect(s()).toEqual({ value: 1 });
			});
		});
	});
	describe('works with observables', () => {
		it('with initial value', () => {
			TestBed.runInInjectionContext(() => {
				const value = new BehaviorSubject(1);
				const s = computedFrom([value]);
				expect(s()).toEqual([1]);
			});
		});
		it('without initial value', () => {
			TestBed.runInInjectionContext(() => {
				const value = new Subject<number>();
				const s = computedFrom([value.pipe(startWith(1))]);
				expect(s()).toEqual([1]);
			});
		});
		it(`for Observables that don't emit synchronously, computedFrom will throw error`, () => {
			TestBed.runInInjectionContext(() => {
				const late = of(1).pipe(delay(1000)); // late emit after 1s
				expect(() => {
					computedFrom([late]);
				}).toThrowError(/requireSync/i); // Throw error NG0601 due to `toSignal` + `requireSync: true`
				// This will prevent old "spurious sync emit" of `null` or Input ([], {}) that can cause TS runtime errors
				// expect(() => s()[0].toFixed(2)).toThrowError(/null/i); // Notice that this previously exploded at runtime, - TS don't catch it!!!
				// tick(1000); // wait 1s for late emit
				// expect(s()).toEqual([1]); // now we have the real value
				// expect(s()[0].toFixed(2)).toEqual('1.00'); // here we can call s()[0].toFixed(2) and will works!
			});
		});
		it(`for Observables that don't emit synchronously, you can pass options.initialValue to prevent error`, fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const late = of(1).pipe(delay(1000)); // late emit after 1s
				const s = computedFrom([late], { initialValue: [42] });
				expect(s()).toEqual([42]); // set initial signal with passed initialValue - value must be coerent with Ouput type
				expect(() => s()[0].toFixed(2)).not.toThrow(); //.toEqual('42.00'); // No more TS runtime error!!!
				tick(1000); // wait 1s for late emit
				expect(s()).toEqual([1]); // now we have the real value
				expect(s()[0].toFixed(2)).toEqual('1.00'); // here we can call s()[0].toFixed(2) and will works!
			});
		}));
		it('value inside array', () => {
			TestBed.runInInjectionContext(() => {
				const value = new BehaviorSubject(1);
				const s = computedFrom([value]);
				expect(s()).toEqual([1]);
			});
		});
		it('value inside object', () => {
			TestBed.runInInjectionContext(() => {
				const value = new BehaviorSubject(1);
				const s = computedFrom({ value });
				expect(s()).toEqual({ value: 1 });
			});
		});
	});
	describe('works with promise/array/primitive (converted to ob$ by from)', () => {
		it('with Promise.resolve value (probably not so common case) will throw error', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = Promise.resolve(1);
				expect(() => {
					computedFrom([value]);
				}).toThrowError(/requireSync/i); // This is so tricky the Promise is converted with `from` and will emit 1 after Microtask - so Signal don't get sync initial value and throw error
				// expect(s()).toEqual([null]); // This is so tricky the Promise is converted with `from` and will emit 1 after Microtask - so Signal initial set to `null`
				// expect(() => s()[0].toFixed(2)).toThrowError(/null/i); // Notice that this previously exploded at runtime - TS don't catch it!!!
				// tick(1); // just wait a bit "Promise Microtask" just to get from(Promise) to emit its resolved value
				// expect(s()).toEqual([1]);
				// expect(s()[0].toFixed(2)).toEqual('1.00'); // here we can call s()[0].toFixed(2) and will works!
			});
		}));
		it('with real async value, you can pass options.initialValue to prevent error, then real value', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = new Promise<string>((resolve) =>
					setTimeout(resolve, 1000, 'a')
				); //Promise that emit 'a' after 1s
				const s = computedFrom(
					{ value },
					{ initialValue: { value: 'initial' } }
				);
				expect(s()).toEqual({ value: 'initial' }); // set initial Signal with passed `initialValue` - value must be coerent with Ouput type
				expect(() => s().value.toUpperCase()).not.toThrow(); //.toEqual('INITIAL');  // No more TS runtime error!!!
				tick(1000); // wait 1s for late emit of Promise
				expect(s()).toEqual({ value: 'a' }); // after 1s we have the resolved value
				expect(s().value.toUpperCase()).toEqual('A'); // here we can call s().value.toUpperCase() and will works!
			});
		}));
		it('with a primitive string (that is Iterable), interally converted with from(iter) will emit single value last char (maybe not expected!? -> I suggest using of() for primitives/array)', () => {
			TestBed.runInInjectionContext(() => {
				const iter = 'abcd';
				const s = computedFrom([iter]); // correctly infer Signal<{value: string}> but it's char!!!
				expect(s()).toEqual(['d']); // here is the tricky part - we get the last char of the string (that is an Iterable)
				expect(s()).not.toEqual([iter]); // not the original string 'abcd' this is due to internal from('abcd') -> of('a','b','c','d')
			});
		});
		it('with an array (that is Iterable), internally converted with from(arr) will emit sync single value last item (maybe not expected!? -> I suggest using of() for primitives/array)', () => {
			TestBed.runInInjectionContext(() => {
				const arr = [1, 2, 3, 42];
				const s = computedFrom({ value: arr }); // correctly infer Signal<{value: number}> not Array!!!
				expect(s()).toEqual({ value: 42 }); // here is the tricky part - we get the last value of the array (that is an Iterable)
				expect(s().value).not.toEqual(arr); // not original array [1,2,3,42] this is due to internal from([1,2,3,42]) -> of(1,2,3,42)
			});
		});
	});
	describe('works with observables and signals', () => {
		it('value inside array', () => {
			TestBed.runInInjectionContext(() => {
				const valueS = signal(1);
				const valueO = new BehaviorSubject(1);
				const s = computedFrom([valueS, valueO]);
				expect(s()).toEqual([1, 1]);
			});
		});
		it('value inside object', () => {
			TestBed.runInInjectionContext(() => {
				const valueS = signal(1);
				const valueO = new BehaviorSubject(1);
				const s = computedFrom({ valueS, valueO });
				expect(s()).toEqual({ valueS: 1, valueO: 1 });
			});
		});
	});
	describe('works with observables, signals and rxjs operators', () => {
		it('by using rxjs operators directly', () => {
			TestBed.runInInjectionContext(() => {
				const valueS = signal(1);
				const valueO = new BehaviorSubject(1);

				const s = computedFrom(
					[valueS, valueO],
					map(([s, o]) => [s + 1, o + 1])
				);

				expect(s()).toEqual([2, 2]);
			});
		});
		it('by using pipe operator', () => {
			TestBed.runInInjectionContext(() => {
				const valueS = signal(1);
				const valueO = new BehaviorSubject(1);

				const s = computedFrom(
					[valueS, valueO],
					pipe(
						map(([s, o]) => [s + 1, o + 1]),
						filter(([s, o]) => s >= 2 && o >= 2)
					)
				);

				expect(s()).toEqual([2, 2]);

				// TODO: enable this test when flushEffects is available
				// valueS.set(2);
				// valueO.next(2);
				// TestBed.flushEffects();
				// expect(s()).toEqual([3, 3]);
			});
		});

		describe('by using async operators', () => {
			@Component({ standalone: true, template: '{{c()}}' })
			class TestComponent {
				a = signal(1);
				b$ = new BehaviorSubject('2');

				c = computedFrom(
					[this.a, this.b$],
					pipe(
						switchMap(
							([a, b]) =>
								// of(a+b) is supposed to be an asynchronous operation (e.g. http request)
								of(a + b).pipe(delay(1000)) // delay the emission of the combined value by 1 second for demonstration purposes
						)
					),
					{ initialValue: 'initial' }
				);
			}

			let component: TestComponent;
			let fixture: ComponentFixture<TestComponent>;

			beforeEach(async () => {
				fixture = TestBed.createComponent(TestComponent);
				component = fixture.componentInstance;
			});

			it('tricky spurious sync emission', fakeAsync(() => {
				fixture.detectChanges(); // initial change detection to trigger effect scheduler
				expect(component.c()).toEqual('initial'); // initialValue passed with options third params to prevent error due to delay in switchMap
				expect(fixture.nativeElement.textContent).toEqual('initial'); // view is updated with initial value

				fixture.detectChanges(); // trigger effect scheduler (for the moment)
				tick(1000); // wait 1s for switchMap delay

				expect(component.c()).toEqual('12'); // this is the real expected value of the swithMap -> 1+'2'='12' thanks to JS ^_^
				fixture.detectChanges(); // trigger effect scheduler again
				expect(fixture.nativeElement.textContent).toEqual('12');

				component.a.set(4);

				// by running CD we are triggering the effect scheduler
				// if we comment this line, the effect scheduler will not be triggered
				// and the signal value will not be updated after 1s
				// PLAY WITH IT BY COMMENTING THIS LINE
				fixture.detectChanges();

				expect(component.c()).toEqual('12'); // value is still '12' because of delay in switchMap
				expect(fixture.nativeElement.textContent).toEqual('12');

				tick(1000); // wait 1s for switchMap delay

				expect(component.c()).toEqual('42'); // value is now '42'. But we need to run CD to update the view
				// view is not updated because CD has not been run
				expect(fixture.nativeElement.textContent).toEqual('12');

				fixture.detectChanges(); // trigger change detection to update the view
				expect(fixture.nativeElement.textContent).toEqual('42');
			}));
		});

		describe('works in ngOnInit by passing an Injector', () => {
			@Component({ standalone: true, template: '' })
			class InInitComponent implements OnInit {
				@Input() inputValue = 1;
				valueS = signal(1);
				injector = inject(Injector);
				data!: Signal<number>;

				ngOnInit() {
					this.data = computedFrom(
						[this.valueS],
						map(([s]) => s + this.inputValue),
						{ injector: this.injector }
					);
				}
			}

			let component: InInitComponent;

			beforeEach(async () => {
				const fixture = TestBed.createComponent(InInitComponent);
				component = fixture.componentInstance;
			});

			it('should not throw an error', () => {
				component.inputValue = 2;
				component.ngOnInit();
				expect(component.data()).toBe(3);
				component.inputValue = 3;
				component.ngOnInit();
				expect(component.data()).toBe(4);
			});
		});
	});
	describe('tricky parts', () => {
		it('should throw error for ob$ without initial value', () => {
			TestBed.runInInjectionContext(() => {
				const page$ = new Subject<number>(); // Subject doesn't have an initial value
				const filters$ = new BehaviorSubject({ name: 'John' });
				expect(() => {
					computedFrom([page$, filters$]);
				}).toThrowError(/requireSync/i); // now throw error! No more old spurious `null` .toEqual([null, { name: 'John' }]);
			});
		});
		it('but we can use options.initialValue to prevent error', () => {
			TestBed.runInInjectionContext(() => {
				const page$ = new Subject<number>(); // Subject doesn't have an initial value
				const filters$ = new BehaviorSubject({ name: 'John' });
				const combined = computedFrom([page$, filters$], {
					initialValue: [42, { name: 'John' }],
				});
				expect(() => combined()).not.toThrow();
				expect(combined()).toEqual([42, { name: 'John' }]);
			});
		});
		it('but we can use startWith to fix late Observable', () => {
			TestBed.runInInjectionContext(() => {
				const page$ = new Subject<number>(); // Subject doesn't have an initial value
				const filters$ = new BehaviorSubject({ name: 'Doe' });
				const combined = computedFrom([
					page$.pipe(startWith(0)), // change the initial value to 0
					filters$,
				]);
				expect(combined()).toEqual([0, { name: 'Doe' }]);
			});
		});
		it('or we can use startWith to fix pipe chain', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const page$ = of(1).pipe(delay(1000)); // late emit after 1s
				const filters$ = new BehaviorSubject({ name: 'String' });
				const combined = computedFrom(
					{ page: page$, filter: filters$ },
					pipe(
						switchMap(({ page, filter }) => of(page + filter.name)),
						startWith(42) // force initial sync emit 42
					)
				); // correctly infers Signal<string|number>
				expect(combined()).toEqual(42);
				tick(1000);
				expect(combined()).toEqual('1String');
			});
		}));
	});
});
