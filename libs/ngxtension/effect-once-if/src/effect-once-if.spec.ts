import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { effectOnceIf } from './effect-once-if';

function createTestComponent(triggerValue: number) {
	const log: string[] = [];
	const logCleanup: string[] = [];

	@Component({ standalone: true, template: '' })
	class Example {
		count = signal(0);

		ref = effectOnceIf(
			() => this.count() === triggerValue,
			(value, onCleanup) => {
				log.push(`received ${triggerValue}: ${value}`);
				onCleanup(() => {
					logCleanup.push(`cleaning effect with condition ${triggerValue}`);
				});
			},
		);
	}

	return { component: Example, log, logCleanup };
}

describe(effectOnceIf.name, () => {
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
