import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
	provideRelativeTimeFormatOptions,
	RelativeTimeFormatPipe,
} from './relative-time-format.pipe';

@Component({
	standalone: true,
	template: `
		<p>{{ 1 | relativeTimeFormat: 'day' }}</p>
		<p>{{ -1 | relativeTimeFormat: 'day' }}</p>
		<p>{{ 2 | relativeTimeFormat: 'day' : 'short' }}</p>
	`,
	imports: [RelativeTimeFormatPipe],
})
class TestComponent {}

@Component({
	standalone: true,
	template: `
		<p>{{ 1 | relativeTimeFormat: 'day' }}</p>
		<p>{{ -1 | relativeTimeFormat: 'day' }}</p>
		<p>{{ 2 | relativeTimeFormat: 'day' : 'narrow' }}</p>
	`,
	imports: [RelativeTimeFormatPipe],
	providers: [
		// Optional, default options are {localeMatcher: 'best fit', numeric: 'always', style: 'long'}
		provideRelativeTimeFormatOptions({ numeric: 'auto' }),
	],
})
class TestComponentWithProvider {}

describe(RelativeTimeFormatPipe.name, () => {
	it('should display the relative time format of the value', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('in 1 day');
		expect(elP[1].nativeElement.textContent).toContain('1 day ago');
		expect(elP[2].nativeElement.textContent).toContain('in 2 days');
	});

	it('should display the relative time format of the value with the provided options', () => {
		const fixture = TestBed.createComponent(TestComponentWithProvider);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('tomorrow');
		expect(elP[1].nativeElement.textContent).toContain('yesterday');
		expect(elP[2].nativeElement.textContent).toContain('in 2d');
	});
});
