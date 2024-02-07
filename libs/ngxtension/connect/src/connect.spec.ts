import {
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	Injector,
	OnInit,
	signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { map, of, Subject, take } from 'rxjs';
import { connect } from './connect';

describe(connect.name, () => {
	describe('ConnectedSignal', () => {
		it('should connect with a stream returning partial state', () => {
			const state = signal({
				user: {
					firstName: 'chau',
					lastName: 'tran',
				},
				age: 30,
				likes: ['angular', 'typescript'],
			});

			TestBed.runInInjectionContext(() => {
				const connectedSignal = connect(state).with(
					of({ user: { firstName: 'Chau', lastName: 'Tran' } }),
				);

				expect(state().user).toEqual({ firstName: 'Chau', lastName: 'Tran' });

				connectedSignal.with(of(32).pipe(map((age) => ({ age }))));
				expect(state().age).toEqual(32);

				connectedSignal.with(of('ngxtension'), (prev, newLike) => ({
					likes: [...prev.likes, newLike],
				}));
				expect(state().likes).toEqual(['angular', 'typescript', 'ngxtension']);

				connectedSignal.with(
					of({ firstName: 'Enea', newLike: 'rx-angular', age: 99 /* lol */ }),
					(prev, { firstName, newLike, age }) => ({
						user: { ...prev.user, firstName },
						age,
						likes: [...prev.likes, newLike],
					}),
				);
				expect(state()).toEqual({
					user: { firstName: 'Enea', lastName: 'Tran' },
					age: 99,
					likes: ['angular', 'typescript', 'ngxtension', 'rx-angular'],
				});
			});
		});

		it('should allow connecting with a partial value from signal', () => {
			const state = signal({
				user: {
					firstName: 'chau',
					lastName: 'tran',
				},
				age: 30,
				likes: ['angular', 'typescript'],
			});

			TestBed.runInInjectionContext(() => {
				const sourceSignalOne = signal({
					user: { firstName: 'Chau', lastName: 'Tran' },
				});
				const expectedOne = {
					...state(),
					user: { firstName: 'Chau', lastName: 'Tran' },
				};
				const connectedSignal = connect(state).with(() => sourceSignalOne());
				TestBed.flushEffects();
				expect(state()).toEqual(expectedOne);

				const sourceSignalTwo = signal({ age: 32 });
				const expectedTwo = { ...expectedOne, age: 32 };
				connectedSignal.with(() => sourceSignalTwo());
				TestBed.flushEffects();
				expect(state()).toEqual(expectedTwo);

				sourceSignalOne.set({
					user: { firstName: 'Josh', lastName: 'Morony' },
				});
				const expectedThree = {
					...expectedTwo,
					user: { firstName: 'Josh', lastName: 'Morony' },
				};
				TestBed.flushEffects();
				expect(state()).toEqual(expectedThree);
			});
		});

		it('should allow connecting primitive value', () => {
			const state = signal(4);

			TestBed.runInInjectionContext(() => {
				const sourceSignalOne = signal(5);
				connect(state).with(() => sourceSignalOne());
				TestBed.flushEffects();
				expect(state()).toEqual(5);
			});
		});
	});

	describe('connects an observable to a signal in injection context', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent {
			count = signal(0);
			source$ = new Subject<number>();

			objectSignal = signal<any>({});
			reducerSignal = signal<any>({});
			objectSource$ = new Subject<any>();

			// this works too
			// sub = connect(this.count, this.source$.pipe(take(2)));

			constructor() {
				connect(this.count, this.source$.pipe(take(2)));
				connect(this.objectSignal, this.objectSource$);
				connect(this.reducerSignal, this.objectSource$, (_, curr) => {
					return curr;
				});
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

		it('correctly updates from literal object values to non-literal object values', () => {
			component.objectSource$.next(null);
			expect(component.objectSignal()).toEqual(null);

			component.objectSource$.next({});
			expect(component.objectSignal()).toEqual({});

			component.objectSource$.next('test');
			expect(component.objectSignal()).toEqual('test');

			component.objectSource$.next({});
			component.objectSource$.next(1);
			expect(component.objectSignal()).toEqual(1);

			component.objectSource$.next({});
			component.objectSource$.next(undefined);
			expect(component.objectSignal()).toEqual(undefined);

			component.objectSource$.next({});
			component.objectSource$.next([]);
			expect(component.objectSignal()).toEqual([]);
		});

		it('correctly updates from object literal object values with reducer', () => {
			component.objectSource$.next(null);
			expect(component.reducerSignal()).toEqual(null);
		});
	});

	describe('connects a signal to a signal in injection context', () => {
		@Component({
			standalone: true,
			template: '{{ count() }}-{{ mainCount() }}',
		})
		class TestComponent {
			mainCount = signal(0);
			count = signal(0);

			constructor() {
				connect(this.count, () => this.mainCount());
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});

		it('works fine', () => {
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('0-0');

			component.mainCount.set(1);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('1-1');

			component.mainCount.set(2);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toBe('2-2');
		});
	});

	describe('connects to a slice of a state signal', () => {
		it('should update properly', () => {
			const state = signal({
				user: {
					firstName: 'chau',
					lastName: 'tran',
				},
				age: 30,
				likes: ['angular', 'typescript'],
			});

			TestBed.runInInjectionContext(() => {
				expect(state().user).toEqual({ firstName: 'chau', lastName: 'tran' });

				connect(state, of({ user: { firstName: 'Chau', lastName: 'Tran' } }));
				expect(state().user).toEqual({ firstName: 'Chau', lastName: 'Tran' });

				expect(state().age).toEqual(30);
				connect(state, of(32).pipe(map((age) => ({ age }))));
				expect(state().age).toEqual(32);

				expect(state().likes).toEqual(['angular', 'typescript']);
				connect(state, of('ngxtension'), (prev, newLike) => ({
					likes: [...prev.likes, newLike],
				}));
				expect(state().likes).toEqual(['angular', 'typescript', 'ngxtension']);

				connect(
					state,
					of({ firstName: 'Enea', newLike: 'rx-angular', age: 99 /* lol */ }),
					(prev, { firstName, newLike, age }) => ({
						user: { ...prev.user, firstName },
						age,
						likes: [...prev.likes, newLike],
					}),
				);
				expect(state()).toEqual({
					user: { firstName: 'Enea', lastName: 'Tran' },
					age: 99,
					likes: ['angular', 'typescript', 'ngxtension', 'rx-angular'],
				});

				connect(state, of('Jahollari'), (prev, lastName) => ({
					user: { ...prev.user, lastName },
				}));
				expect(state()).toEqual({
					user: { firstName: 'Enea', lastName: 'Jahollari' },
					age: 99,
					likes: ['angular', 'typescript', 'ngxtension', 'rx-angular'],
				});
			});
		});

		it('should allow computed properties to behave properly', () => {
			@Component({ standalone: true, template: '' })
			class TestComponent {
				state = signal({
					user: {
						firstName: 'chau',
						lastName: 'tran',
					},
				});

				firstName = computed(() => this.state().user.firstName);
				lastName = computed(() => this.state().user.lastName);

				firstNameEffectCount = 0;
				lastNameEffectCount = 0;

				lastName$ = new Subject<string>();

				constructor() {
					effect(() => {
						console.log(this.firstName());
						this.firstNameEffectCount += 1;
					});

					effect(() => {
						console.log(this.lastName());
						this.lastNameEffectCount += 1;
					});

					connect(this.state, this.lastName$, (prev, lastName) => ({
						user: { ...prev.user, lastName },
					}));
				}
			}

			const fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();

			const component = fixture.componentInstance;
			expect(component.firstNameEffectCount).toEqual(1);
			expect(component.lastNameEffectCount).toEqual(1);

			component.lastName$.next('Tran');
			fixture.detectChanges();

			// updating lastName should not run firstName effect
			expect(component.firstNameEffectCount).toEqual(1);
			expect(component.lastNameEffectCount).toEqual(2);
		});
	});

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

	describe('connects an observable with single emit to a null signal in injection context', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent {
			text = signal<string | null>(null);

			constructor() {
				connect(this.text, of('text'));
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});
		it('works fine', () => {
			expect(component.text()).toBe('text');
		});
	});
	describe('connects an observable with multiple emits to a null signal in injection context', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent {
			text = signal<string | null>(null);

			constructor() {
				connect(this.text, of('text', null, 'text2'));
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});
		it('works fine', () => {
			expect(component.text()).toBe('text2');
		});
	});
});
