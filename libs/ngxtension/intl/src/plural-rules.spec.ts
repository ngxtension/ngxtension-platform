import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
	PluralRulesPipe,
	providePluralRulesOptions,
} from './plural-rules.pipe';

@Component({
	standalone: true,
	template: `
		<p>{{ 1 | pluralRules }}</p>
		<p>{{ 2 | pluralRules }}</p>
		<p>{{ 3 | pluralRules }}</p>
	`,
	imports: [PluralRulesPipe],
})
class TestComponent {}

@Component({
	standalone: true,
	template: `
		<p>{{ 1 | pluralRules }}</p>
		<p>{{ 2 | pluralRules }}</p>
		<p>{{ 3 | pluralRules }}</p>
	`,
	imports: [PluralRulesPipe],
	providers: [providePluralRulesOptions({ type: 'ordinal' })],
})
class TestComponentWithProvider {}

describe(PluralRulesPipe.name, () => {
	it('should display the plural category of the value', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('one');
		expect(elP[1].nativeElement.textContent).toContain('other');
		expect(elP[2].nativeElement.textContent).toContain('other');
	});

	it('should display the plural category of the value with the provided options', () => {
		const fixture = TestBed.createComponent(TestComponentWithProvider);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('one');
		expect(elP[1].nativeElement.textContent).toContain('two');
		expect(elP[2].nativeElement.textContent).toContain('few');
	});
});
