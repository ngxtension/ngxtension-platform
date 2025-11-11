import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
	RepeatPipe,
	lengthErrorMessageBuilder,
	startAtErrorMessageBuilder,
} from './repeat-pipe';

describe(RepeatPipe.name, () => {
	@Component({
		standalone: true,
		template: `
			<p *ngFor="let i of 3 | repeat">{{ i }}</p>
		`,
		imports: [RepeatPipe, NgFor],
	})
	class DirectiveDummy {}

	it('given 3, when render, then render 3 items', () => {
		const fixture = TestBed.createComponent(DirectiveDummy);
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(3);
		items.forEach((item, i) => {
			expect(item.nativeElement.textContent).toContain(i.toString());
		});
	});

	@Component({
		standalone: true,
		template: `
			@for (i of 3 | repeat; track i) {
				<p>{{ i }}</p>
			}
		`,
		imports: [RepeatPipe],
	})
	class ControlFlowDummy {}

	it('given 3 with control flow syntax, when render, then render 3 items', () => {
		const fixture = TestBed.createComponent(ControlFlowDummy);
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(3);
		items.forEach((item, i) => {
			expect(item.nativeElement.textContent).toContain(i.toString());
		});
	});
});

describe(`${RepeatPipe.name} configuration`, () => {
	@Component({
		standalone: true,
		template: `
			@for (i of length | repeat: startAt; track i) {
				<p>{{ i }}</p>
			}
		`,
		imports: [RepeatPipe],
	})
	class RepeatDummy {
		length = 10;
		startAt = 0;
	}

	let component: RepeatDummy;
	let fixture: ComponentFixture<RepeatDummy>;

	beforeEach(() => {
		fixture = TestBed.createComponent(RepeatDummy);
		component = fixture.componentInstance;
	});

	it('given 10 and startAt 10, when render, then render 10 items', () => {
		component.startAt = 10;
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(component.length);
		items.forEach((item, i) => {
			expect(item.nativeElement.textContent).toContain((i + 10).toString());
		});
	});

	it('given 0, when render, then render 0 items', () => {
		component.length = 0;
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(component.length);
	});

	const detectChanges = () => {
		fixture.detectChanges();
	};

	it('given -1, when render, then render 0 items', () => {
		component.length = -1;

		expect(detectChanges).toThrow(lengthErrorMessageBuilder('-1'));

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(0);
	});

	it('given 1.5, when render, then render 0 items', () => {
		component.length = 1.5;

		expect(detectChanges).toThrow(lengthErrorMessageBuilder('1.5'));

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(0);
	});

	it('given "test", when render, then render 0 items', () => {
		component.length = 'test' as unknown as number;

		expect(detectChanges).toThrow(lengthErrorMessageBuilder('test'));

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(0);
	});

	it('given -10 startAt, when render, then render 10 items starting at -10', () => {
		component.startAt = -10;

		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(10);
		items.forEach((item, i) => {
			expect(item.nativeElement.textContent).toContain((i - 10).toString());
		});
	});

	it('given 1.5 startAt, when render, then render 0 items', () => {
		component.startAt = 1.5;

		expect(detectChanges).toThrow(startAtErrorMessageBuilder('1.5'));

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(0);
	});

	it('given "test" startAt, when render, then render 0 items', () => {
		component.startAt = 'test' as unknown as number;

		expect(detectChanges).toThrow(startAtErrorMessageBuilder('test'));

		const items = fixture.debugElement.queryAll(By.css('p'));
		expect(items).toHaveLength(0);
	});
});
