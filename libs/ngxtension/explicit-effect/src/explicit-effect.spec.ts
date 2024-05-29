import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { explicitEffect } from './explicit-effect';

describe(explicitEffect.name, () => {
	let log: string[] = [];

	beforeEach(() => {
		log = [];
	});

	@Component({
		standalone: true,
		template: '',
	})
	class Foo {
		count = signal(0);
		state = signal('idle');

		constructor() {
			const dep1 = signal(0);

			const dep = () => {
				dep1.update((x) => x + 1); // This will trigger the effect error
				return dep1();
			};

			explicitEffect(
				[this.count, this.state, dep],
				([count, state, dep], cleanup) => {
					log.push(`count updated ${count}, ${state}`);
				},
			);
		}
	}

	it('should register deps and run effect', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();
		expect(log.length).toBe(1);

		fixture.componentInstance.count.set(1);
		fixture.detectChanges();
		expect(log.length).toBe(2);
	});

	it('should not run when unresgistered dep', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();
		expect(log.length).toBe(1);

		fixture.componentInstance.state.set('pending');
		fixture.detectChanges();
		expect(log.length).toBe(1);
	});
});
