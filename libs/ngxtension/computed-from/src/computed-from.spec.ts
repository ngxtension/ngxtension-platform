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
						filter(([s, o]) => s === 2 && o === 2)
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
					)
				); //INFER SIGNAL<string> BUT SPURIOUS FIRST SYNC EMISSIONS [number, string] <-- TYPESCIPT WILL NOT CATCH THIS!
			}

			let component: TestComponent;
			let fixture: ComponentFixture<TestComponent>;

			beforeEach(async () => {
				fixture = TestBed.createComponent(TestComponent);
				component = fixture.componentInstance;
			});

			it('tricky spurious sync emission', fakeAsync(() => {
				fixture.detectChanges(); // initial change detection to trigger effect scheduler
				expect(component.c()).toEqual([1, '2']); // initial value is [1,'2'] because of delay in switchMap
				//THIS IS A BIG PROBLEM FOR THE DEVS THAT BELIAVE c() IS A Signal<string> BUT GET A SPURIOUS TUPLE VALUE OF [number, string]
				//WHAT HAPPENS IF THE console.warn(c().toUpperCase()); <-- THIS WILL EXPLODE AT RUNTIME - TS DON'T CATCH IT!!!
				expect(fixture.nativeElement.textContent).toEqual('1,2'); //NOTICE ',' SEPARATOR THIS IS ARRAY.toString([1,2])

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
						this.injector
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
		it('should emit null for ob$ without initial value', () => {
			TestBed.runInInjectionContext(() => {
				const page$ = new Subject<number>(); // Subject doesn't have an initial value
				const filters$ = new BehaviorSubject({ name: 'John' });
				const combined = computedFrom([page$, filters$]);
				expect(combined()).toEqual([null, { name: 'John' }]);
			});
		});
		it('but we can use startWith to fix Subject', () => {
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
		it('or we can use startWith operator to fix', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const page$ = of(1).pipe(delay(1000)); // late emit after 1s
				const filters$ = new BehaviorSubject({ name: 'String' });
				const combined = computedFrom(
					{ page: page$, filter: filters$ },
					pipe(
						switchMap(({ page, filter }) => of(page + filter.name)),
						startWith(42)
					)
				); //CORRECTLY INFERS Signal<string|number>
				expect(combined()).toEqual(42);
				tick(1000);
				expect(combined()).toEqual('1String');
			});
		}));
	});
});
