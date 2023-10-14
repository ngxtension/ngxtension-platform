import { AsyncPipe } from '@angular/common';
import {
	Component,
	DebugElement,
	INJECTOR,
	OnInit,
	inject,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { injectActiveElement } from './active-element';

describe('injectActiveElement', () => {
	@Component({
		standalone: true,
		imports: [AsyncPipe],
		template: `
			<button>btn1</button>
			<button>btn2</button>
			<button>btn3</button>
			<span>{{ (activeElement | async)?.innerHTML }}</span>
		`,
	})
	class TestComponent {
		activeElement = injectActiveElement();
	}

	it('update focussed element when it changes', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		const buttons = fixture.debugElement.queryAll(By.css('button'));
		const span: DebugElement = fixture.debugElement.query(By.css('span'));

		const buttonToFocus = buttons.at(1);

		buttonToFocus?.nativeElement.focus();
		fixture.detectChanges();

		const actual = span.nativeElement.innerHTML;
		const expected = buttonToFocus?.nativeElement.innerHTML;

		expect(actual).toBe(expected);
	});

	it('be null when no active element', () => {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		const buttons = fixture.debugElement.queryAll(By.css('button'));
		const span: DebugElement = fixture.debugElement.query(By.css('span'));

		const buttonToFocus = buttons.at(1);

		buttonToFocus?.nativeElement.focus();
		fixture.detectChanges();
		buttonToFocus?.nativeElement.blur();
		fixture.detectChanges();

		const actual = span.nativeElement.innerHTML;
		const expected = '';

		expect(actual).toBe(expected);
	});

	it('work with given injector', () => {
		@Component({
			standalone: true,
			imports: [AsyncPipe],
			template: `
				<button>btn1</button>
				<button>btn2</button>
				<button>btn3</button>
				<span>{{ (activeElement | async)?.innerHTML }}</span>
			`,
		})
		class DummyComponent implements OnInit {
			readonly injector = inject(INJECTOR);
			activeElement?: Observable<Element | null>;

			ngOnInit(): void {
				this.activeElement = injectActiveElement(this.injector);
			}
		}

		const fixture = TestBed.createComponent(DummyComponent);
		fixture.detectChanges();
		const buttons = fixture.debugElement.queryAll(By.css('button'));
		const span: DebugElement = fixture.debugElement.query(By.css('span'));

		const buttonToFocus = buttons.at(2);

		buttonToFocus?.nativeElement.focus();
		fixture.detectChanges();

		const actual = span.nativeElement.innerHTML;
		const expected = buttonToFocus?.nativeElement.innerHTML;

		expect(actual).toBe(expected);
	});
});
