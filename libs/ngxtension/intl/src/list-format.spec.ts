import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ListFormatPipe, provideListFormatOptions } from './list-format.pipe';

@Component({
	standalone: true,
	template: `
		<p>{{ ['a', 'b', 'c'] | listFormat }}</p>
		<p>{{ ['a', 'b', 'c'] | listFormat: 'short' }}</p>
	`,
	imports: [ListFormatPipe],
})
class TestComponent {}

@Component({
	standalone: true,
	template: `
		<p>{{ ['a', 'b', 'c'] | listFormat }}</p>
		<p>{{ ['a', 'b', 'c'] | listFormat: 'long' }}</p>
	`,
	imports: [ListFormatPipe],
	providers: [provideListFormatOptions({ style: 'short' })],
})
class TestComponentWithProvider {}

describe(ListFormatPipe.name, () => {
	it('should display the list of values', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('a, b, and c');
		expect(elP[1].nativeElement.textContent).toContain('a, b, & c');
	});

	it('should display the list of values with the provided options', () => {
		const fixture = TestBed.createComponent(TestComponentWithProvider);
		fixture.detectChanges();

		const elP = fixture.debugElement.queryAll(By.css('p'));
		expect(elP[0].nativeElement.textContent).toContain('a, b, & c');
		expect(elP[1].nativeElement.textContent).toContain('a, b, and c');
	});
});
