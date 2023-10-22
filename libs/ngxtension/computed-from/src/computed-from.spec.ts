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
import exp = require('constants');

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
		it(`MD FIX for Observables that don't emit synchronously, computedFrom will THROW ERROR`, () => {
			TestBed.runInInjectionContext(() => {
				const late = of(1).pipe(delay(1000)); // late emit after 1s
				expect(() => {
					const s = computedFrom([late]);
				}).toThrowError(/requireSync/i); //THROW ERROR NG0601 DUE TO toSignal + requireSync: true
				//THIS WILL PREVENT OLD "SPURIOUS SYNC EMIT" OF null OR Input ([], {}) THAT CAN CAUSE TS RUNTIME ERRORS
				// expect(() => s()[0].toFixed(2)).toThrowError(/null/i); //NOTICE THAT THIS WILL EXPLODE AT RUNTIME - TS DON'T CATCH IT!!!
				// tick(1000); //WAIT 1s FOR LATE EMIT
				// expect(s()).toEqual([1]); //NOW WE HAVE THE REAL VALUE
				// expect(s()[0].toFixed(2)).toEqual('1.00'); //HERE WE CAN CALL s()[0].toFixed(2) <-- THIS WILL WORK
			});
		});
		it(`MD FIX for Observables that don't emit synchronously, you can pass options.initialValue TO PREVENT ERROR`, fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const late = of(1).pipe(delay(1000)); // late emit after 1s
				const s = computedFrom([late], { initialValue: [42] });
				expect(s()).toEqual([42]); //SET INITIAL SIGNAL WITH PASSED initialValue MUST BE COERENT WITH THE OUTPUT TYPE
				expect(() => s()[0].toFixed(2)).not.toThrow(); //.toEqual('42.00'); //NO MORE TS RUNTIME ERROR!!!
				tick(1000); //WAIT 1s FOR LATE EMIT
				expect(s()).toEqual([1]); //NOW WE HAVE THE REAL VALUE
				expect(s()[0].toFixed(2)).toEqual('1.00'); //HERE WE CAN CALL s()[0].toFixed(2) <-- THIS WILL WORK
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
	describe('MD FIX works with promise/array/primitive (converted to ob$ by from)', () => {
		it('MD FIX with Promise.resolve value (probably not so common case) will THROW ERROR', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = Promise.resolve(1);
				expect(() => {
					const s = computedFrom([value]);
				}).toThrowError(/requireSync/i); //THIS IS SO TRICKY THE PROMISE IS CONVERTED WITH from AND WILL EMIT 1 AFTER MICROTASK - SO SIGNAL DON'T GET SYNC INITIAL VALUE AND THROW ERROR
				// expect(s()).toEqual([null]); //THIS IS SO TRICKY THE PROMISE IS CONVERTED WITH from AND WILL EMIT 1 AFTER MICROTASK - SO SIGNAL INITIAL SET TO null
				// expect(() => s()[0].toFixed(2)).toThrowError(/null/i); //NOTICE THAT THIS WILL EXPLODE AT RUNTIME - TS DON'T CATCH IT!!!
				// tick(1); //JUST WAIT A BIT "Promise Microtask" JUST TO GET from(Promise) TO EMIT ITS INITAL VALUE
				// expect(s()).toEqual([1]);
				// expect(s()[0].toFixed(2)).toEqual('1.00'); //HERE WE CAN CALL s()[0].toFixed(2) <-- THIS WILL WORK
			});
		}));
		it('MD FIX with real async value, you can pass options.initialValue TO PREVENT ERROR, then real value', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const value = new Promise<string>((resolve) =>
					setTimeout(resolve, 1000, 'a')
				); //Promise that emit 'a' after 1s
				const s = computedFrom(
					{ value },
					{ initialValue: { value: 'initial' } }
				);
				expect(s()).toEqual({ value: 'initial' }); //SET INITIAL SIGNAL WITH PASSED initialValue MUST BE COERENT WITH THE OUTPUT TYPE
				expect(() => s().value.toUpperCase()).not.toThrow(); //.toEqual('INITIAL');  //NO MORE TS RUNTIME ERROR!!!
				tick(1000); //WAIT 1s FOR LATE EMIT OF Promise
				expect(s()).toEqual({ value: 'a' }); //AFTER 1s WE HAVE THE REAL VALUE
				expect(s().value.toUpperCase()).toEqual('A'); //HERE WE CAN CALL s().value.toUpperCase() <-- THIS WILL WORK
			});
		}));
		it('MD with a primitive string (that is Iterable), interally converted with from(iter) will emit single value LAST CHAR (maybe not expected!? -> I suggest using of() for primitives/array)', () => {
			TestBed.runInInjectionContext(() => {
				const iter = 'abcd';
				const s = computedFrom([iter]); //CORRECTLY INFER Signal<{value: string}> BUT IT'S CHARS!!!
				expect(s()).toEqual(['d']); //HERE IS THE TRICKY PART - WE GET THE LAST CHAR OF THE STRING THAT IS AN ITERABLE!!!
				expect(s()).not.toEqual([iter]); //NOT THE ORIGINAL STRING 'abcd' THIS IS BECOUSE from('abcd') -> of('a','b','c','d')
			});
		});
		it('MD with an array (that is Iterable), internally converted with from(arr) will emit sync single value LAST ITEM (maybe not expected!? -> I suggest using of() for primitives/array)', () => {
			TestBed.runInInjectionContext(() => {
				const arr = [1, 2, 3, 42];
				const s = computedFrom({ value: arr }); //CORRECTLY INFER Signal<{value: number}> NOT ARRAY!!!
				expect(s()).toEqual({ value: 42 }); //HERE IS THE TRICKY PART - WE GET THE LAST VALUE OF THE ARRAY THAT IS AN ITERABLE!!!
				expect(s().value).not.toEqual(arr); //NOT ORIGINAL ARRAY [1,2,3,42] THIS IS BECOUSE from([1,2,3,42]) -> of(1,2,3,42)
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
				); //INFER SIGNAL<string> BUT SPURIOUS FIRST SYNC EMISSIONS [number, string] <-- TYPESCIPT WILL NOT CATCH THIS!
			}

			let component: TestComponent;
			let fixture: ComponentFixture<TestComponent>;

			beforeEach(async () => {
				fixture = TestBed.createComponent(TestComponent);
				component = fixture.componentInstance;
			});

			it('MD tricky spurious sync emission', fakeAsync(() => {
				fixture.detectChanges(); // initial change detection to trigger effect scheduler
				expect(component.c()).toEqual('initial'); // initial value PASSED WITH OPTIONS because of delay in switchMap
				//THIS IS A BIG PROBLEM FOR THE DEVS THAT BELIAVE c() IS A Signal<string> BUT GET A SPURIOUS TUPLE VALUE OF [number, string]
				//WHAT HAPPENS IF THE console.warn(c().toUpperCase()); <-- THIS WILL EXPLODE AT RUNTIME - TS DON'T CATCH IT!!!
				expect(fixture.nativeElement.textContent).toEqual('initial'); //NOTICE ',' SEPARATOR THIS IS ARRAY.toString([1,'2'])

				fixture.detectChanges(); // trigger effect scheduler (for the moment)
				tick(1000); // wait 1s for switchMap delay

				expect(component.c()).toEqual('12'); //THIS IS THE REAL EXPECTED VALUE OF THE swithMap RESULT 1+'2'='12' THANKS TO JS ^_^
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
	describe('MD FIX tricky parts', () => {
		it('MD FIX should THROW ERROR for ob$ without initial value', () => {
			TestBed.runInInjectionContext(() => {
				const page$ = new Subject<number>(); // Subject doesn't have an initial value
				const filters$ = new BehaviorSubject({ name: 'John' });
				expect(() => {
					const combined = computedFrom([page$, filters$]);
				}).toThrowError(/requireSync/i); //NOW THROW ERROR NO MORE OLD SPURIOUS null .toEqual([null, { name: 'John' }]);
			});
		});
		it('MD FIX but we can use options.initialValue TO PREVENT ERROR', () => {
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
		it('MD but we can use startWith to fix late Observable', () => {
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
		it('MD or we can use startWith to fix pipe chain', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const page$ = of(1).pipe(delay(1000)); // late emit after 1s
				const filters$ = new BehaviorSubject({ name: 'String' });
				const combined = computedFrom(
					{ page: page$, filter: filters$ },
					pipe(
						switchMap(({ page, filter }) => of(page + filter.name)),
						startWith(42) // force initial sync emit 42
					)
				); //CORRECTLY INFERS Signal<string|number>
				expect(combined()).toEqual(42);
				tick(1000);
				expect(combined()).toEqual('1String');
			});
		}));
	});
});
