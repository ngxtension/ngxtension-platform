import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
	DisplayNamesPipe,
	provideDisplayNamesOptions,
} from './display-names.pipe';

@Component({
	standalone: true,
	template: `
		<p>{{ 'en-US' | displayNames: 'language' }}</p>
		<p>{{ 'US' | displayNames: 'region' }}</p>
		<p>{{ 'US' | displayNames: 'region' : 'long' }}</p>
	`,
	imports: [DisplayNamesPipe],
})
class TestComponent {}

@Component({
	standalone: true,
	template: `
		<p>{{ 'en-US' | displayNames: 'language' }}</p>
		<p>{{ 'US' | displayNames: 'region' }}</p>
		<p>{{ 'US' | displayNames: 'region' : 'short' }}</p>
	`,
	imports: [DisplayNamesPipe],
	providers: [
		// Optional, default options are {style: 'short', localeMatcher: 'lookup', fallback: 'code'}
		provideDisplayNamesOptions({ style: 'long' }),
	],
})
class TestComponentWithProvider {}

describe(DisplayNamesPipe.name, () => {
	it('should display the display name of the code', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('US English');
		expect(elP[1].nativeElement.textContent).toContain('US');
		expect(elP[2].nativeElement.textContent).toContain('United States');
	});

	it('should display the display name of the code with the provided options', () => {
		const fixture = TestBed.createComponent(TestComponentWithProvider);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('American English');
		expect(elP[1].nativeElement.textContent).toContain('United States');
		expect(elP[2].nativeElement.textContent).toContain('US');
	});
});
