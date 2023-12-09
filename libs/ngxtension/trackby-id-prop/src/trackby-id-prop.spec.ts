import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TRACK_BY_DIRECTIVES } from './trackby-id-prop';

describe('TrackByDirectives', () => {
	@Component({
		standalone: true,
		template: `
			<i *ngFor="let item of arr; trackById">{{ item.name }}</i>
			<p *ngFor="let item of arr; trackByProp: 'name'">{{ item.id }}</p>
		`,
		imports: [NgFor, TRACK_BY_DIRECTIVES],
	})
	class Dummy {
		arr = [
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
			{ id: 3, name: 'c' },
		];
	}

	it('given items with id, you can use trackById in *ngFor to render all of them', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('i'));
		expect(items).toHaveLength(3);
		items.forEach((item, i) => {
			expect(item.nativeElement.textContent).toContain(
				String.fromCharCode(97 + i),
			);
		});
	});
	it('given items with props, you can use trackByProp in *ngFor to render all of them', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(3);
		items.forEach((item, i) => {
			expect(item.nativeElement.textContent).toContain((i + 1).toString());
		});
	});
});
