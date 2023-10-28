import { Component, afterNextRender, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectAutoEffect } from './auto-effect';

describe(injectAutoEffect.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class Test {
		autoEffect = injectAutoEffect();

		count = signal(0);
		tick = 0;
		cleanUpTick = 0;

		constructor() {
			afterNextRender(() => {
				this.autoEffect(() => {
					this.count();
					this.tick += 1;

					return () => (this.cleanUpTick += 1);
				});
			});
		}
	}

	function setup() {
		const fixture = TestBed.createComponent(Test);
		const component = fixture.componentInstance;
		fixture.detectChanges();
		return [
			fixture,
			[() => component.tick, () => component.cleanUpTick],
			(value: number) => {
				component.count.set(value);
				fixture.detectChanges();
			},
		] as const;
	}

	it('should work properly in afterNextRender (OnInit)', () => {
		const [fixture, [tick, cleanUpTick], setCount] = setup();
		expect(tick()).toEqual(0);
		expect(cleanUpTick()).toEqual(0);

		setCount(2);
		expect(tick()).toEqual(1);
		expect(cleanUpTick()).toEqual(0);

		setCount(2);
		expect(tick()).toEqual(1);
		expect(cleanUpTick()).toEqual(0);

		setCount(3);
		expect(tick()).toEqual(2);
		expect(cleanUpTick()).toEqual(1);

		fixture.destroy();
		expect(tick()).toEqual(2);
		expect(cleanUpTick()).toEqual(2);

		setCount(4);
		setCount(5);
		expect(tick()).toEqual(2);
		expect(cleanUpTick()).toEqual(2);
	});
});
