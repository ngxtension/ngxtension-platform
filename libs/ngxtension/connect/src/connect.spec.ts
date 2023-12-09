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
