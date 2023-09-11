import {
	Component,
	inject,
	Injector,
	Input,
	OnInit,
	Signal,
	signal,
} from '@angular/core';
import {
	ComponentFixture,
	fakeAsync,
	TestBed,
	tick,
} from '@angular/core/testing';
import {
	BehaviorSubject,
	delay,
	filter,
	map,
	of,
	pipe,
	startWith,
	Subject,
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
			@Component({ standalone: true, template: '{{s()}}' })
			class TestComponent {
				valueS = signal(1);
				valueO = new BehaviorSubject(1);

				s = computedFrom(
					[this.valueS, this.valueO],
					pipe(
						map(([s, o]) => [s + 1, o + 1]),
						switchMap((v) => of(v).pipe(delay(1000)))
					)
				);
			}

			let component: TestComponent;
			let fixture: ComponentFixture<TestComponent>;

			beforeEach(async () => {
				await TestBed.configureTestingModule({
					imports: [TestComponent],
				}).compileComponents();
				fixture = TestBed.createComponent(TestComponent);
				component = fixture.componentInstance;
			});

			it('should handle async stuff', fakeAsync(() => {
				fixture.detectChanges(); // initial change detection to trigger effect scheduler
				expect(component.s()).toEqual([1, 1]); // initial value is 1,1 because of delay in switchMap
				expect(fixture.nativeElement.textContent).toEqual('1,1');

				fixture.detectChanges(); // trigger effect scheduler (for the moment)
				tick(1000); // wait 1s for switchMap delay

				expect(component.s()).toEqual([2, 2]);
				fixture.detectChanges(); // trigger effect scheduler again
				expect(fixture.nativeElement.textContent).toEqual('2,2');

				component.valueS.set(3);
				component.valueO.next(3);

				// by running CD we are triggering the effect scheduler
				// if we comment this line, the effect scheduler will not be triggered
				// and the signal value will not be updated after 1s
				// PLAY WITH IT BY COMMENTING THIS LINE
				fixture.detectChanges();

				expect(component.s()).toEqual([2, 2]); // value is still 2,2 because of delay in switchMap
				expect(fixture.nativeElement.textContent).toEqual('2,2');

				tick(1000); // wait 1s for switchMap delay

				expect(component.s()).toEqual([4, 4]); // value is now 4,4. But we need to run CD to update the view
				// view is not updated because CD has not been run
				expect(fixture.nativeElement.textContent).toEqual('2,2');

				fixture.detectChanges(); // trigger change detection to update the view
				expect(fixture.nativeElement.textContent).toEqual('4,4');
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
				await TestBed.configureTestingModule({
					imports: [InInitComponent],
				}).compileComponents();
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
});
