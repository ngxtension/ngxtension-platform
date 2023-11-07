import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { computed } from './computed';

describe(computed.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class Test {
		count = signal(0);
		multiplier = signal(1);

		result = computed<number>((currentValue) => {
			if (this.multiplier() % 2 === 0) {
				return this.count() * this.multiplier();
			}
			return currentValue;
		});

		track = 0;
		trackedResult = computed<number>((currentValue) => {
			this.track += 1;
			if (this.multiplier() % 2 === 0) {
				return this.count() * this.multiplier();
			}
			return currentValue;
		});
	}

	function setup() {
		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should work properly', () => {
		const component = setup();

		expect(component.result()).toEqual(undefined);

		component.count.set(1);
		expect(component.result()).toEqual(undefined);

		component.multiplier.set(2);
		expect(component.result()).toEqual(2);

		component.multiplier.set(3);
		expect(component.result()).toEqual(2);
	});

	it('should track dep properly', () => {
		const component = setup();

		// kick off computed
		expect(component.trackedResult()).toEqual(undefined);
		// track increments
		expect(component.track).toEqual(1);

		// set count only while multipler is still odd
		component.count.set(1);
		// result is still undefined
		expect(component.trackedResult()).toEqual(undefined);
		// computed is not reinvoked
		expect(component.track).toEqual(1);

		// set count only again
		component.count.set(2);
		// result is still undefined
		expect(component.trackedResult()).toEqual(undefined);
		// computed is not reinvoked
		expect(component.track).toEqual(1);

		// set multiplier to an even number
		component.multiplier.set(2);
		// result is now 4 (multipler * count)
		expect(component.trackedResult()).toEqual(4);
		// computed is invoked because multiplier changes
		expect(component.track).toEqual(2);

		// set multiplier back to an odd number
		component.multiplier.set(3);
		// result is 4 because it returns the currentValue
		expect(component.trackedResult()).toEqual(4);
		// computed is reinvoked because multiplier changes
		expect(component.track).toEqual(3);

		// set count while multiplier is an odd number
		component.count.set(3);
		// result is still 4 because it returns the currentValue
		expect(component.trackedResult()).toEqual(4);
		// computed is not reinvoked
		expect(component.track).toEqual(3);
	});
});
