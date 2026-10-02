import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { effect } from 'ngxtension/effect';

function createTestComponent(triggerValue: number) {
	const log: string[] = [];
	const logCleanup: string[] = [];

	@Component({ standalone: true, template: '' })
	class Example {
		count = signal(0);

		ref = effect(
			[() => this.count() === triggerValue],
			{ once: true, filter: Boolean },
			([value], _previousValues, onCleanup) => {
				log.push(`received ${triggerValue}: ${value}`);
				onCleanup(() => {
					logCleanup.push(`cleaning effect with condition ${triggerValue}`);
				});
			},
		);
	}

	return { component: Example, log, logCleanup };
}

describe('effectOnceIf behavior with effect', () => {
	it('should run effect once and cleanup', () => {
		const test = createTestComponent(2);
		const fixture = TestBed.createComponent(test.component);
		fixture.detectChanges();
		expect(test.log).toEqual([]);
		expect(test.logCleanup).toEqual([]);

		fixture.componentInstance.count.set(1);
		fixture.detectChanges();
		expect(test.log).toEqual([]);
		expect(test.logCleanup).toEqual([]);

		fixture.componentInstance.count.set(2);
		fixture.detectChanges();
		expect(test.log).toEqual(['received 2: true']);
		expect(test.logCleanup).toEqual(['cleaning effect with condition 2']);

		fixture.componentInstance.count.set(3);
		fixture.detectChanges();
		expect(test.log).toEqual(['received 2: true']);
		expect(test.logCleanup).toEqual(['cleaning effect with condition 2']);
	});

	it('should run effect once and cleanup on init', () => {
		const test = createTestComponent(0);
		const fixture = TestBed.createComponent(test.component);
		fixture.detectChanges();
		expect(test.log).toEqual(['received 0: true']);
		expect(test.logCleanup).toEqual(['cleaning effect with condition 0']);

		fixture.componentInstance.count.set(1);
		fixture.detectChanges();
		expect(test.log).toEqual(['received 0: true']);
		expect(test.logCleanup).toEqual(['cleaning effect with condition 0']);
	});
});
