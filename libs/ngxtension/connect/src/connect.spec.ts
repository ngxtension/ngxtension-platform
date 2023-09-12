import {
	Component,
	DestroyRef,
	inject,
	Injector,
	OnInit,
	signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, take } from 'rxjs';
import { connect } from './connect';

describe(connect.name, () => {
	describe('connects an observable to a signal in injection context', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent {
			count = signal(0);
			source$ = new Subject<number>();

			// this works too
			// sub = connect(this.count, this.source$.pipe(take(2)));

			constructor() {
				connect(this.count, this.source$.pipe(take(2)));
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});

		it('works fine', () => {
			expect(component.count()).toBe(0);

			component.source$.next(1);
			expect(component.count()).toBe(1);

			component.source$.next(2);
			expect(component.count()).toBe(2);

			component.source$.next(3);
			expect(component.count()).toBe(2); // should not change because we only took 2 values
		});
	});
	describe('connects an observable to a signal not in injection context using injector', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent implements OnInit {
			count = signal(0);
			source$ = new Subject<number>();
			injector = inject(Injector);

			ngOnInit() {
				connect(this.count, this.source$.pipe(take(2)), this.injector);
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});

		it('works fine', () => {
			component.ngOnInit();

			expect(component.count()).toBe(0);

			component.source$.next(1);
			expect(component.count()).toBe(1);

			component.source$.next(2);
			expect(component.count()).toBe(2);

			component.source$.next(3);
			expect(component.count()).toBe(2); // should not change because we only took 2 values
		});
	});
	describe('connects an observable to a signal not in injection context using destroyRef', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent implements OnInit {
			count = signal(0);
			source$ = new Subject<number>();
			destroyRef = inject(DestroyRef);

			ngOnInit() {
				connect(this.count, this.source$.pipe(take(2)), this.destroyRef);
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});

		it('works fine', () => {
			component.ngOnInit();

			expect(component.count()).toBe(0);

			component.source$.next(1);
			expect(component.count()).toBe(1);

			component.source$.next(2);
			expect(component.count()).toBe(2);

			component.source$.next(3);
			expect(component.count()).toBe(2); // should not change because we only took 2 values
		});
	});
	describe('stops subscription if sub is unsubscribed', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent {
			count = signal(0);
			source$ = new Subject<number>();

			sub = connect(this.count, this.source$.pipe(take(2)));
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});

		it('works fine', () => {
			expect(component.count()).toBe(0);

			component.source$.next(1);
			expect(component.count()).toBe(1);

			component.sub.unsubscribe();

			component.source$.next(2);
			expect(component.count()).toBe(1); // should not change because we unsubscribed

			component.source$.next(3);
			expect(component.count()).toBe(1); // should not change
		});
	});
});
