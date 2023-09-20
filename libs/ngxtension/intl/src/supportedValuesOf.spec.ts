import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SupportedValuesOf } from './supportedValuesOf.pipe';

@Component({
	standalone: true,
	template: `
		<p>{{ 'currency' | supportedValuesOf }}</p>
		<p>{{ 'unit' | supportedValuesOf }}</p>
	`,
	imports: [SupportedValuesOf],
})
class TestComponent {}

describe(SupportedValuesOf.name, () => {
	it('should display the supported values of the type', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('USD');
		expect(elP[1].nativeElement.textContent).toContain('meter');
	});
});
