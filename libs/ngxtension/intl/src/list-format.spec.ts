import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ListFormatPipe, provideListFormatOptions } from './list-format.pipe';

@Component({
	standalone: true,
	template: `
		<p>{{ ['a', 'b', 'c'] | listFormat }}</p>
	`,
	imports: [ListFormatPipe],
})
class TestComponent {}

@Component({
	standalone: true,
	template: `
		<p>{{ ['a', 'b', 'c'] | listFormat }}</p>
	`,
	imports: [ListFormatPipe],
	providers: [
		provideListFormatOptions({ style: 'short', type: 'disjunction' }),
	],
})
class TestComponentWithProvider {}

describe(ListFormatPipe.name, () => {
	it('should display the list of values', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		const elP = fixture.debugElement.query(By.css('p'));
		expect(elP.nativeElement.textContent).toContain('a, b, and c');
	});

	it('should display the list of values with the provided options', () => {
		const fixture = TestBed.createComponent(TestComponentWithProvider);
		fixture.detectChanges();

		const elP = fixture.debugElement.query(By.css('p'));
		expect(elP.nativeElement.textContent).toContain('a, b, or c');
	});
});
