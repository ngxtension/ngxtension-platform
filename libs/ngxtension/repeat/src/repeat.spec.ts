import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Repeat } from './repeat';

describe(Repeat.name, () => {
	@Component({
		standalone: true,
		template: `
			<p *ngFor="let i; repeat: 3">{{ i }}</p>
		`,
		imports: [Repeat],
	})
	class Dummy {}

	it('given 3, when render, then render 3 items', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(3);
		items.forEach((item, i) => {
			expect(item.nativeElement.textContent).toContain(i.toString());
		});
	});
});
