import { CommonModule } from '@angular/common';
import {
	Component,
	Provider,
	TemplateRef,
	ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
	FormControl,
	FormGroupDirective,
	NgForm,
	Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import {
	NGX_DEFAULT_CONTROL_ERROR_STATE_MATCHER,
	NgxControlError,
	NgxControlErrorContext,
	provideNgxControlError,
} from './control-error';

describe('NgxControlError', () => {
	const unitTest = (test: () => void | Promise<void>) => async () => {
		TestBed.overrideProvider(TemplateRef, { useValue: undefined });
		TestBed.overrideProvider(ViewContainerRef, {
			useValue: {
				clear: jest.fn(),
				createEmbeddedView: (
					templateRef: TemplateRef<NgxControlErrorContext>,
					context: NgxControlErrorContext,
				) => ({
					templateRef,
					context,
				}),
			},
		});
		await TestBed.runInInjectionContext(test);
	};

	const render = (
		template: string,
		inputs?: Partial<NgxControlError> | undefined,
		providers?: Provider[],
	) => {
		@Component({
			imports: [CommonModule, NgxControlError],
			standalone: true,
			template,
			providers,
		})
		class Container {
			constructor() {
				Object.assign(this, inputs);
			}
		}

		const fixture = TestBed.createComponent(Container);
		fixture.detectChanges();

		const controlError = fixture.debugElement
			.queryAllNodes(By.directive(NgxControlError))[0]
			.injector.get(NgxControlError);

		return [fixture, controlError] as const;
	};

	beforeEach(() => TestBed.resetTestingModule());

	it(
		'should be created',
		unitTest(() => expect(new NgxControlError()).toBeTruthy()),
	);

	it(
		'should have a context guard',
		unitTest(() =>
			expect(
				NgxControlError.ngTemplateContextGuard(new NgxControlError(), {}),
			).toBe(true),
		),
	);

	describe('should have an error when the control includes the tracked error and the control is in an error state', () => {
		it(
			'respecting track changes',
			unitTest(() => {
				const instance = new NgxControlError();

				instance.track$.set('required');
				instance.control$.set(new FormControl('', Validators.required));
				instance.errorStateMatcher$.set(() => of(true));
				TestBed.flushEffects();

				expect(instance.hasError$()).toBe(true);

				instance.track$.set('otherError');
				TestBed.flushEffects();

				expect(instance.hasError$()).toBe(false);
			}),
		);

		it(
			'when it has at least 1 tracked error ',
			unitTest(() => {
				const instance = new NgxControlError();
				const control = new FormControl('42', [
					Validators.minLength(3),
					Validators.email,
				]);

				instance.track$.set(['minlength', 'email']);
				instance.control$.set(control);
				instance.errorStateMatcher$.set(() => of(true));
				TestBed.flushEffects();

				expect(Object.keys(control.errors ?? {})).toHaveLength(2);
				expect(instance.hasError$()).toBe(true);

				control.setValue('123');

				expect(Object.keys(control.errors ?? {})).toHaveLength(1);
				expect(instance.hasError$()).toBe(true);
			}),
		);

		it(
			'respecting error state matcher changes',
			unitTest(() => {
				const instance = new NgxControlError();

				instance.track$.set('required');
				instance.control$.set(new FormControl('', Validators.required));
				instance.errorStateMatcher$.set(() => of(true));
				TestBed.flushEffects();

				expect(instance.hasError$()).toBe(true);

				instance.errorStateMatcher$.set(() => of(false));
				TestBed.flushEffects();

				expect(instance.hasError$()).toBe(false);
			}),
		);

		it(
			'respecting control instance changes',
			unitTest(() => {
				const instance = new NgxControlError();

				instance.track$.set('required');
				instance.control$.set(new FormControl('', Validators.required));
				instance.errorStateMatcher$.set(() => of(true));
				TestBed.flushEffects();

				expect(instance.hasError$()).toBe(true);

				instance.control$.set(new FormControl(''));
				TestBed.flushEffects();

				expect(instance.hasError$()).toBe(false);
			}),
		);
	});

	it(
		'DEFAULT_ERROR_STATE_MATCHER should match when the control is: 1. invalid 2. touched or its parent is submitted',
		unitTest(() => {
			const instance = new NgxControlError();
			const control = new FormControl('', Validators.required);

			instance.track$.set('required');
			instance.control$.set(control);
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(false);

			control.markAsTouched();
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(true);

			control.markAsUntouched();
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(false);

			control.markAsTouched();
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(true);

			control.removeValidators(Validators.required);
			control.updateValueAndValidity();
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(false);

			control.addValidators(Validators.required);
			control.updateValueAndValidity();
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(true);

			control.markAsUntouched();
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(false);

			const parent = { ngSubmit: new Subject<void>(), submitted: false } as
				| NgForm
				| FormGroupDirective;
			instance.parent$.set(parent);
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(false);

			parent.ngSubmit.next(undefined);
			TestBed.flushEffects();
			expect(instance.hasError$()).toBe(true);
			expect(control.touched).toBe(false);
		}),
	);

	it('should support micro syntax', () => {
		const params = {
			error: 'required',
			control: new FormControl('', Validators.required),
			parent: new NgForm([], []),
			stateMatcher: () => of(true),
		};

		const [fixture, controlError] = render(
			`<span *ngxControlError="control; track: error; errorStateMatcher: stateMatcher; parent: parent; let errors">{{ errors[error] }}</span>`,
			params,
		);

		fixture.detectChanges();

		expect(controlError.track$()).toEqual(params.error);
		expect(controlError.control$()).toEqual(params.control);
		expect(controlError.errorStateMatcher$()).toEqual(params.stateMatcher);
		expect(controlError.parent$()).toEqual(params.parent);
		expect(fixture.debugElement.nativeElement.textContent).toEqual('true');
	});

	it('should have an injectable error state matcher', () => {
		const errorStateMatcher = jest.fn();

		const [, controlError] = render(
			'<ng-template ngxControlError />',
			undefined,
			provideNgxControlError({ errorStateMatcher: () => errorStateMatcher }),
		);

		expect(controlError.errorStateMatcher$()).toBe(errorStateMatcher);
	});

	it('should use the default error state matcher as default', () => {
		const [, controlError] = render('<ng-template ngxControlError />');

		expect(controlError.errorStateMatcher$()).toBe(
			NGX_DEFAULT_CONTROL_ERROR_STATE_MATCHER,
		);
	});

	it('should render when it has an error', () => {
		const params = {
			error: 'required',
			control: new FormControl('', Validators.required),
			stateMatcher: () => of(true),
		};

		const [fixture, controlError] = render(
			`<span *ngxControlError="control; track: error, errorStateMatcher: stateMatcher">42</span>`,
			params,
		);

		fixture.detectChanges();

		expect(fixture.debugElement.nativeElement.textContent).toBe('42');

		controlError.errorStateMatcher = () => of(false);

		fixture.detectChanges();

		expect(fixture.debugElement.nativeElement.textContent).toBe('');
	});

	it('should reference the controls errors, control and tracked errors in its context', () => {
		const params = {
			error: 'required',
			control: new FormControl('', Validators.required),
			stateMatcher: () => of(true),
		};

		const [fixture] = render(
			`<span *ngxControlError="control; track: error; errorStateMatcher: stateMatcher; let errors; let _control = control; let _track = track">{{ _control.status }} - {{ errors[_track] }}</span>`,
			params,
		);

		fixture.detectChanges();

		expect(fixture.debugElement.nativeElement.textContent).toEqual(
			'INVALID - true',
		);
	});
});
