import { Component, effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createComputed, createSignal } from './create-signal';

describe(createSignal.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class Foo {
		state = createSignal({ count: 0 });
		simpleState = createSignal(0);

		doubleCount = createComputed(() => this.state.value.count * 2);
		doubleSimpleCount = createComputed(() => this.simpleState.value * 2);

		stateLogs: number[] = [];
		simpleStateLogs: number[] = [];

		constructor() {
			effect(() => {
				this.stateLogs.push(this.state.value.count);
			});

			effect(() => {
				this.simpleStateLogs.push(this.simpleState.value);
			});
		}

		increment() {
			this.state.value = { count: this.state.value.count + 1 };
			this.simpleState.value++;
		}

		reset() {
			this.state.value = { count: 0 };
			this.simpleState.value = 0;
		}
	}

	it('should update logs array and double computed correctly', () => {
		const fixture = TestBed.createComponent(Foo);
		const component = fixture.componentInstance;
		fixture.detectChanges();
		expect(component.stateLogs).toEqual([0]);
		expect(component.simpleStateLogs).toEqual([0]);

		expect(component.doubleCount.value).toBe(0);
		expect(component.doubleSimpleCount.value).toBe(0);

		component.increment();

		fixture.detectChanges();
		expect(component.stateLogs).toEqual([0, 1]);
		expect(component.simpleStateLogs).toEqual([0, 1]);

		expect(component.doubleCount.value).toBe(2);
		expect(component.doubleSimpleCount.value).toBe(2);

		component.increment();

		fixture.detectChanges();

		expect(component.stateLogs).toEqual([0, 1, 2]);
		expect(component.simpleStateLogs).toEqual([0, 1, 2]);

		component.reset();

		fixture.detectChanges();

		expect(component.stateLogs).toEqual([0, 1, 2, 0]);
		expect(component.simpleStateLogs).toEqual([0, 1, 2, 0]);

		expect(component.doubleCount.value).toBe(0);
		expect(component.doubleSimpleCount.value).toBe(0);
	});
});
