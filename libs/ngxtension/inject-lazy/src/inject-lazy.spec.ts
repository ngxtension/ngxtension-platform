import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectorRef,
	Component,
	inject,
	Injectable,
	Injector,
	OnInit,
	Type,
} from '@angular/core';
import {
	ComponentFixture,
	fakeAsync,
	TestBed,
	tick,
} from '@angular/core/testing';
import { catchError, of, switchMap } from 'rxjs';
import { injectLazy } from './inject-lazy';
import { mockLazyProvider } from './inject-lazy-impl';

@Injectable({ providedIn: 'root' })
export class MyService {
	data$ = of(1);
}

const lazyServiceImport = () =>
	new Promise<Type<MyService>>((resolve) => {
		setTimeout(() => {
			return resolve(MyService);
		}, 500);
	});

const lazyServiceImportWithError = () =>
	new Promise<Type<MyService>>((resolve, reject) => {
		setTimeout(() => {
			return reject(new Error('error loading service'));
		}, 500);
	});

const lazyDefaultServiceImport = () =>
	new Promise<{ default: Type<MyService> }>((resolve) => {
		setTimeout(() => {
			return resolve({ default: MyService });
		}, 500);
	});

describe(injectLazy.name, () => {
	describe('lazy loads a service', () => {
		@Component({
			standalone: true,
			imports: [AsyncPipe],
			template: '<div>{{data$ | async}}</div>',
		})
		class TestComponent {
			private myLazyService$ = injectLazy(lazyServiceImport);
			data$ = this.myLazyService$.pipe(switchMap((service) => service.data$));
		}

		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
		});

		it('using normal import in injection context', fakeAsync(() => {
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('');
			tick(499);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('');
			tick(1);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('1');
		}));
	});

	describe('lazy loads a service that is exported as default', () => {
		@Component({
			standalone: true,
			imports: [AsyncPipe],
			template: '<div>{{data$ | async}}</div>',
		})
		class TestComponent {
			private myLazyService$ = injectLazy(lazyDefaultServiceImport);
			data$ = this.myLazyService$.pipe(switchMap((service) => service.data$));
		}

		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
		});

		it('in injection context', fakeAsync(() => {
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('');
			tick(499);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('');
			tick(1);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('1');
		}));
	});

	describe('lazy loads a service not in injection context', () => {
		@Component({ standalone: true, template: '<div>{{data}}</div>' })
		class TestComponent implements OnInit {
			private injector = inject(Injector);
			private cdr = inject(ChangeDetectorRef);

			data = 0;

			ngOnInit() {
				injectLazy(lazyServiceImport, this.injector)
					.pipe(switchMap((service) => service.data$))
					.subscribe((data) => {
						this.data = data;
						this.cdr.detectChanges();
					});
			}
		}

		let fixture: ComponentFixture<TestComponent>;
		let component: TestComponent;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});

		it('by passing an injector', fakeAsync(() => {
			component.ngOnInit();
			expect(fixture.nativeElement.textContent).toBe('');
			tick(499);
			expect(fixture.nativeElement.textContent).toBe('');
			tick(1);
			expect(fixture.nativeElement.textContent).toBe('1');
		}));
	});

	describe('can be mocked using mockLazyProvider', () => {
		@Injectable({ providedIn: 'root' })
		class MyLazyService {
			data = 2;
		}

		@Injectable()
		class MockService {
			data = 3;
		}

		const myLazyServiceImport = () => Promise.resolve(MyLazyService);

		@Component({ standalone: true, template: '' })
		class TestComponent {
			myLazyService$ = injectLazy(myLazyServiceImport);
		}

		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			TestBed.configureTestingModule({
				providers: [
					// 👇 here we provide mocked service
					mockLazyProvider(MyLazyService, MockService),
				],
			});
			fixture = TestBed.createComponent(TestComponent);
		});

		it('using normal import in injection context', (done) => {
			fixture.componentInstance.myLazyService$.subscribe((service) => {
				expect(service.data).toBe(3);
				done();
			});
		});
	});

	describe('throws an error', () => {
		@Component({
			standalone: true,
			imports: [AsyncPipe],
			template: '<div>{{data$ | async}}</div>',
		})
		class TestComponent {
			private myLazyService$ = injectLazy(() => lazyServiceImportWithError());
			data$ = this.myLazyService$.pipe(
				switchMap((service) => service.data$),
				catchError((error) => {
					return of(error.message);
				})
			);
		}

		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
		});

		it('when import fails', fakeAsync(() => {
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('');
			tick(499);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('');
			tick(1);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('error loading service');
		}));
	});
});
