import { CommonModule } from '@angular/common';
import { Component, Provider, inject } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import {
	FormControl,
	FormsModule,
	NgControl,
	ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgxControlValueAccessor } from './control-value-accessor';

describe('NgxControlValueAccessor', () => {
	@Component({
		selector: 'custom-input',
		hostDirectives: [
			{
				directive: NgxControlValueAccessor,
				inputs: ['value', 'disabled', 'compareTo'],
				outputs: ['valueChange'],
			},
		],
		template: `
			<input
				(input)="cva.value = $event.target.value"
				[value]="cva.value$()"
				[disabled]="cva.disabled$()"
				(blur)="cva.markAsTouched()"
			/>
		`,
		standalone: true,
	})
	class CustomInput {
		cva = inject<NgxControlValueAccessor<string>>(NgxControlValueAccessor);
	}

	const render = <T>(
		template: string,
		params?: T | undefined,
		providers?: Provider[],
	) => {
		@Component({
			imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomInput],
			standalone: true,
			template,
			providers,
		})
		class Container {}

		const fixture = TestBed.createComponent(Container);

		const detectChanges = fixture.detectChanges.bind(fixture);

		fixture.detectChanges = (checkNoChanges) => {
			Object.assign(fixture.componentInstance, params);
			detectChanges(checkNoChanges);
		};

		fixture.detectChanges();

		const customInput = fixture.debugElement.query(By.directive(CustomInput));

		const cva = (customInput.componentInstance as CustomInput).cva;

		const ngControl = cva['ngControl'];

		const input = customInput.query(By.css('input'))
			.nativeElement as HTMLInputElement;

		return { fixture, customInput, input, cva, ngControl };
	};

	it('should be created', () => {
		const { cva } = render(`<custom-input />`);
		expect(cva).toBeTruthy();
	});

	it('should have a compareTo input', () => {
		const params = {
			compareTo: () => false,
		};

		const { cva } = render(`<custom-input [compareTo]="compareTo" />`, params);

		expect(cva.compareTo).toBe(params.compareTo);
	});

	it('should set new values based on its comparator', () => {
		const params = {
			compareTo: () => true,
			value: 42,
		};

		const { fixture, cva } = render(
			`<custom-input [value]="value" [compareTo]="compareTo" />`,
			params,
		);

		expect(cva.value).toEqual(42);

		params.value = 99;
		fixture.detectChanges();

		expect(cva.value).toEqual(42);

		params.compareTo = () => false;
		fixture.detectChanges();

		params.value = -1;
		fixture.detectChanges();

		expect(cva.value).toEqual(-1);
	});

	it('should have a default value of null', () => {
		const { cva } = render(`<custom-input />`);

		expect(cva.value).toEqual(null);
	});

	it('should have a value input', () => {
		const params = {
			value: 'foo',
		};

		const { fixture, cva, input } = render(
			`<custom-input [value]="value" />`,
			params,
		);
		expect(cva.value).toEqual('foo');
		expect(input.value).toEqual('foo');

		params.value = 'bar';
		fixture.detectChanges();
		expect(cva.value).toEqual('bar');
		expect(input.value).toEqual('bar');
	});

	it('should have a value output', () => {
		const params = {
			value: 'foo',
			valueChange: jest.fn(),
		};

		const { fixture, cva, input } = render(
			`<custom-input [value]="value" (valueChange)="valueChange($event)" />`,
			params,
		);
		expect(params.valueChange).not.toHaveBeenCalled();
		expect(cva.value).toEqual('foo');

		params.value = 'bar';
		fixture.detectChanges();
		params.value = 'bar';
		fixture.detectChanges();
		params.value = 'bar';
		fixture.detectChanges();
		expect(params.valueChange).toHaveBeenCalledTimes(1); // expect 1 because of comparator
		expect(params.valueChange).toHaveBeenCalledWith('bar');
		expect(cva.value).toEqual('bar');

		input.value = 'some input event';
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		expect(params.valueChange).toHaveBeenCalledTimes(2);
		expect(params.valueChange).toHaveBeenCalledWith('some input event');
		expect(cva.value).toEqual('some input event');
	});

	it('should not be disabled by default', () => {
		const { cva, input } = render(`<custom-input />`);

		expect(cva.disabled).toEqual(false);
		expect(input.disabled).toEqual(false);
	});

	it('should coerce disabled input to boolean', () => {
		const { cva, input } = render(`<custom-input disabled />`);

		expect(cva.disabled).toEqual(true);
		expect(input.disabled).toEqual(true);
	});

	it('should have a disabled input', () => {
		const params = {
			disabled: true,
		};

		const { fixture, cva, input } = render(
			`<custom-input [disabled]="disabled" />`,
			params,
		);
		expect(cva.disabled).toEqual(true);
		expect(input.disabled).toEqual(true);

		params.disabled = false;
		fixture.detectChanges();
		expect(cva.disabled).toEqual(false);
		expect(input.disabled).toEqual(false);
	});

	it('should only query the element injector', () => {
		const { ngControl, fixture } = render(`<custom-input />`, undefined, [
			{ provide: NgControl, useValue: 'some mock control directive' },
		]);

		expect(ngControl).toEqual(null);
		expect(fixture.debugElement.injector.get(NgControl)).toEqual(
			'some mock control directive',
		);
	});

	describe('with a NgControl', () => {
		it('should be the control value accessor', () => {
			const { ngControl, cva } = render(`<custom-input ngModel />`);

			expect(ngControl?.valueAccessor).toBe(cva);
		});

		describe('referencing a FormControl', () => {
			it('should sync its value', () => {
				const params = {
					control: new FormControl('value from control'),
				};

				const { fixture, cva, input } = render(
					`<custom-input [formControl]="control" />`,
					params,
				);

				expect(cva.value).toEqual('value from control');
				expect(input.value).toEqual('value from control');
				expect(params.control.value).toEqual('value from control');

				params.control.setValue('an other value from control');
				fixture.detectChanges();

				expect(cva.value).toEqual('an other value from control');
				expect(input.value).toEqual('an other value from control');
				expect(params.control.value).toEqual('an other value from control');

				input.value = 'a value from the view';
				input.dispatchEvent(new Event('input'));
				fixture.detectChanges();

				expect(cva.value).toEqual('a value from the view');
				expect(input.value).toEqual('a value from the view');
				expect(params.control.value).toEqual('a value from the view');

				cva.value = 'a value from the cva';
				fixture.detectChanges();

				expect(cva.value).toEqual('a value from the cva');
				expect(input.value).toEqual('a value from the cva');
				expect(params.control.value).toEqual('a value from the cva');
			});

			it('should mark the control as touched on blur', () => {
				const params = {
					control: new FormControl('value from control'),
				};

				const { ngControl, input } = render(
					`<custom-input [formControl]="control" />`,
					params,
				);

				expect(ngControl!.touched).toEqual(false);

				input.dispatchEvent(new Event('blur'));

				expect(ngControl!.touched).toEqual(true);
			});

			it('should sync its disabled state', () => {
				const params = {
					control: new FormControl({ value: '42', disabled: true }),
				};

				const { fixture, cva, input } = render(
					`<custom-input [formControl]="control" />`,
					params,
				);
				expect(cva.disabled).toEqual(true);
				expect(input.disabled).toEqual(true);

				params.control.enable();
				fixture.detectChanges();

				expect(cva.disabled).toEqual(false);
				expect(input.disabled).toEqual(false);

				params.control.disable();
				fixture.detectChanges();

				expect(cva.disabled).toEqual(true);
				expect(input.disabled).toEqual(true);
			});
		});

		describe('referencing a NgModel', () => {
			it('should sync its value', fakeAsync(() => {
				const params = {
					value: 'value from input',
					valueChange: jest.fn(),
				};

				const { fixture, cva, input, ngControl } = render(
					`<custom-input [(ngModel)]="value" />`,
					params,
				);

				// NgModel updates in ngOnChanges in a resolved promise callback
				expect(ngControl!.value).toEqual(null); // this is null because the promise is not resolved yet
				flush();
				fixture.detectChanges();

				expect(ngControl!.value).toEqual('value from input');
				expect(cva.value).toEqual('value from input');
				expect(input.value).toEqual('value from input');

				params.value = 'an other value from input';
				fixture.detectChanges();

				flush();
				fixture.detectChanges();

				expect(ngControl!.value).toEqual('an other value from input');
				expect(cva.value).toEqual('an other value from input');
				expect(input.value).toEqual('an other value from input');

				input.value = 'a value from the view';
				input.dispatchEvent(new Event('input'));

				fixture.detectChanges();

				expect(ngControl!.value).toEqual('a value from the view');
				expect(cva.value).toEqual('a value from the view');
				expect(input.value).toEqual('a value from the view');

				cva.value = 'a value from the cva';
				fixture.detectChanges();

				expect(ngControl!.value).toEqual('a value from the cva');
				expect(cva.value).toEqual('a value from the cva');
				expect(input.value).toEqual('a value from the cva');
			}));

			it('should mark the control as touched on blur', () => {
				const { input, ngControl } = render(`<custom-input ngModel />`);

				expect(ngControl!.touched).toEqual(false);

				input.dispatchEvent(new Event('blur'));

				expect(ngControl!.touched).toEqual(true);
			});

			it('should sync its disabled state', () => {
				const params = { value: '42', disabled: true };

				const { fixture, cva, input, ngControl } = render(
					`<custom-input [disabled]="disabled" [(ngModel)]="value" />`,
					params,
				);
				expect(cva.disabled).toEqual(true);
				expect(input.disabled).toEqual(true);

				ngControl?.control!.enable();
				fixture.detectChanges();

				expect(cva.disabled).toEqual(false);
				expect(input.disabled).toEqual(false);

				ngControl?.control!.disable();
				fixture.detectChanges();

				expect(cva.disabled).toEqual(true);
				expect(input.disabled).toEqual(true);
			});
		});
	});
});
