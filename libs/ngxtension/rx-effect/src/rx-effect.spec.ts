import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';
import { rxEffect } from './rx-effect';

describe(rxEffect.name, () => {
	it('should unsubscribe when the component gets destroyed', () => {
		let status: `${'' | 'un'}subscribed`;

		@Component({
			standalone: true,
			selector: 'child',
			template: '',
		})
		class Child {
			readonly effect = rxEffect(NEVER, {
				subscribe: () => (status = 'subscribed'),
				unsubscribe: () => (status = 'unsubscribed'),
			});
		}

		@Component({
			standalone: true,
			imports: [Child],
			template: `
				@if (display()) {
					<child />
				}
			`,
		})
		class Parent {
			readonly display = signal(true);
		}

		const fixture = TestBed.createComponent(Parent);
		fixture.detectChanges();

		expect(status!).toEqual('subscribed');

		fixture.componentInstance.display.set(false);
		fixture.detectChanges();

		expect(status!).toEqual('unsubscribed');
	});

	it('should manually unsubsribe from the source', () => {
		@Component({
			standalone: true,
			template: '',
		})
		class Elem {
			readonly effect = rxEffect(NEVER);
		}

		const fixture = TestBed.createComponent(Elem);
		const effect = fixture.componentInstance.effect;

		expect(effect.closed).toEqual(false);

		effect.unsubscribe();
		expect(effect.closed).toEqual(true);
	});

	it('should execute the side effect, then complete', () => {
		let result: string;
		const expected = 'hello world';

		@Component({
			standalone: true,
			template: '',
		})
		class Elem {
			readonly effect = rxEffect(of(expected), (value) => (result = value));
		}

		const fixture = TestBed.createComponent(Elem);
		expect(result!).toEqual(expected);
		expect(fixture.componentInstance.effect.closed).toEqual(true);
	});
});
