import { DOCUMENT } from '@angular/common';
import {
	Directive,
	ElementRef,
	Input,
	Renderer2,
	computed,
	effect,
	inject,
	signal,
} from '@angular/core';
import {
	VALIDATION_SKIPPED,
	VALIDATION_UNDEFINED,
	focusFirstInvalidControl,
	getFormAction,
	getFormControls,
	getFormData,
	getFormEncType,
	getFormMethod,
	getValidationMessage,
	isFieldElement,
	isFocusableFormControl,
	parseIntent,
	requestIntent,
	validate,
	type FieldConstraint,
	type FieldsetConstraint,
	type KeysOf,
	type ResolveType,
	type Submission,
} from '@conform-to/dom';
import { parse } from '@conform-to/zod';
import { z } from 'zod';

export type Primitive = null | undefined | string | number | boolean | Date;

export interface FieldConfig<Schema> extends FieldConstraint<Schema> {
	id?: string;
	name: string;
	defaultValue?: FieldValue<Schema>;
	initialError?: Record<string, string[]>;
	form?: string;
	descriptionId?: string;
	errorId?: string;

	/**
	 * The frist error of the field
	 */
	error?: string;

	/**
	 * All of the field errors
	 */
	errors?: string[];
}

export type FieldValue<Schema> = Schema extends Primitive
	? string
	: Schema extends File
		? File
		: Schema extends Array<infer InnerType>
			? Array<FieldValue<InnerType>>
			: unknown extends Schema
				? any
				: Record<string, any> extends Schema
					? { [Key in KeysOf<Schema>]?: FieldValue<ResolveType<Schema, Key>> }
					: any;

type SubmissionResult = {
	intent: Submission['intent'];
	payload: Submission['payload'] | null;
	error: Submission['error'];
};

type FormConfig<
	Output extends Record<string, any>,
	Input extends Record<string, any> = Output,
> = {
	/**
	 * If the form id is provided, Id for label,
	 * input and error elements will be derived.
	 */
	id?: string;

	/**
	 * Define when conform should start validation.
	 * Support "onSubmit", "onInput", "onBlur".
	 *
	 * @default "onSubmit"
	 */
	shouldValidate?: 'onSubmit' | 'onBlur' | 'onInput';

	/**
	 * Define when conform should revalidate again.
	 * Support "onSubmit", "onInput", "onBlur".
	 *
	 * @default shouldValidate, or "onSubmit" if shouldValidate is not provided.
	 */
	shouldRevalidate?: 'onSubmit' | 'onBlur' | 'onInput';

	/**
	 * An object representing the initial value of the form.
	 */
	defaultValue?: FieldValue<Input>;

	/**
	 * An object describing the result of the last submission
	 */
	lastSubmission?: SubmissionResult | null;

	/**
	 * An object describing the constraint of each field
	 */
	constraint?: FieldsetConstraint<Input>;

	/**
	 * Enable native validation before hydation.
	 *
	 * Default to `false`.
	 */
	fallbackNative?: boolean;

	/**
	 * Accept form submission regardless of the form validity.
	 *
	 * Default to `false`.
	 */
	noValidate?: boolean;

	/**
	 * A function to be called when the form should be (re)validated.
	 */
	onValidate: ({
		form,
		formData,
	}: {
		form: HTMLFormElement;
		formData: FormData;
	}) => Submission | Submission<Output>;

	/**
	 * The submit event handler of the form. It will be called
	 * only when the form is considered valid.
	 */
	onSubmit: (
		event: SubmitEvent,
		form: HTMLFormElement,
		context: {
			formData: FormData;
			submission: Submission;
			action: string;
			encType: ReturnType<typeof getFormEncType>;
			method: ReturnType<typeof getFormMethod>;
		},
	) => void;
};

const schema = z.object({
	firstName: z.string().min(4),
	lastName: z.string().min(4),
});

export const FORM_ERROR_ELEMENT_NAME = '__ngx_conform__';

function injectFormReporter(
	formElement: () => HTMLFormElement | null,
	lastSubmission: () => SubmissionResult | null | undefined,
) {
	const submission = signal(lastSubmission());

	const report = (
		form: HTMLFormElement,
		submissionResult: SubmissionResult,
	) => {
		const event = new CustomEvent('ngx-conform', {
			detail: submissionResult.intent,
		});
		form.dispatchEvent(event);
		submission.set(submissionResult);
	};

	effect(() => {
		const [_form, _lastSubmission] = [formElement(), lastSubmission()];

		if (!_form || !_lastSubmission) {
			return;
		}

		if (!_lastSubmission.payload) {
			// If the default value is empty, we can safely reset the form.
			// This ensure the behavior is consistent with and without JS.
			_form.reset();

			// There is no need to report the submission anymore.
			return;
		}

		report(_form, _lastSubmission);
	});

	effect(() => {
		const [_form, _submission] = [formElement(), submission()];

		if (!_form || !_submission) {
			return;
		}

		reportSubmission(_form, _submission);
	});

	return report;
}

export function injectForm<
	Output extends Record<string, any>,
	Input extends Record<string, any> = Output,
>(options: () => FormConfig<Output, Input>) {
	// const errors = signal<string[]>([]);
	const document = inject(DOCUMENT);

	if (!document) {
		console.warn('No DOCUMENT');
		throw new Error();
	}

	const renderer = inject(Renderer2);

	const noValidate = computed(() => options().noValidate || false);
	const shouldValidate = computed(() => options().shouldValidate || 'onSubmit');
	const shouldRevalidate = computed(
		() => options().shouldRevalidate || shouldValidate(),
	);
	const id = computed(() => options().id);
	const onValidate = computed(() => options().onValidate);
	const onSubmit = computed(() => options().onSubmit);

	const lastSubmission = computed(() => options().lastSubmission);
	const lastSubmissionErrors = computed(() => lastSubmission()?.error['']);

	const errors = signal<string[]>([]);

	const formRef = signal<HTMLFormElement | null>(null);

	const report = injectFormReporter(formRef, lastSubmission);

	const formsApi = {
		form: {
			setElement: (formElement: HTMLFormElement) => formRef.set(formElement),
			element: formRef.asReadonly(),
			noValidate,
			error: computed(() => errors()[0]),
			errors: errors.asReadonly(),
			errorId: '',
			id: '',
		},
	};

	effect(() => {
		const formElement = formsApi.form.element();
		if (!formElement) return;
		const formId = id();
		if (formId) {
			formsApi.form.id = formId;
			formsApi.form.errorId = `${formId}-error`;
			renderer.setAttribute(formElement, 'id', formId);
		}
	});

	effect(() => {
		const formElement = formsApi.form.element();
		if (!formElement) return;
		const [errors, errorId] = [formsApi.form.errors(), formsApi.form.errorId];
		if (errorId && errors.length > 0) {
			renderer.setAttribute(formElement, 'aria-invalid', 'true');
			renderer.setAttribute(formElement, 'aria-describedby', errorId);
		}
	});

	effect(() => {
		const formElement = formsApi.form.element();
		if (!formElement) return;
		renderer.setAttribute(formElement, 'noValidate', noValidate().toString());
	});

	effect((onCleanup) => {
		const formElement = formsApi.form.element();
		if (!formElement) return;

		// custom validate handler
		const createValidateHandler = (type: string) => (event: Event) => {
			const field = event.target;
			const [_shouldValidate, _shouldRevalidate] = [
				shouldValidate(),
				shouldRevalidate(),
			];

			if (
				!isFocusableFormControl(field) ||
				field.form !== formElement ||
				!field.name
			) {
				return;
			}

			if (
				field.dataset['conformTouched']
					? _shouldRevalidate === type
					: _shouldValidate === type
			) {
				requestIntent(formElement, validate(field.name));
			}
		};

		const handleInvalid = (event: Event) => {
			const field = event.target;

			if (
				!isFieldElement(field) ||
				field.form !== formElement ||
				field.name !== FORM_ERROR_ELEMENT_NAME
			) {
				return;
			}

			event.preventDefault();

			if (field.dataset['conformTouched']) {
				// setErrors(getErrors(field.validationMessage));
			}
		};
		const handleReset = (event: Event) => {
			if (event.target !== formElement) {
				return;
			}

			// Reset all field state
			for (const element of getFormControls(formElement)) {
				delete element.dataset['conformTouched'];
				element.setCustomValidity('');
			}

			errors.set([]);
			// setDefaultValueFromLastSubmission(null);
		};

		const handleInput = createValidateHandler('onInput');
		const handleBlur = createValidateHandler('onBlur');

		document.addEventListener('input', handleInput, true);
		document.addEventListener('blur', handleBlur, true);
		document.addEventListener('invalid', handleInvalid, true);
		document.addEventListener('reset', handleReset);

		onCleanup(() => {
			document.removeEventListener('input', handleInput, true);
			document.removeEventListener('blur', handleBlur, true);
			document.removeEventListener('invalid', handleInvalid, true);
			document.removeEventListener('reset', handleReset);
		});
	});

	effect((onCleanup) => {
		const formElement = formsApi.form.element();
		if (!formElement) return;

		const handleSubmit = (event: SubmitEvent) => {
			const submitter = event.submitter as
				| HTMLButtonElement
				| HTMLInputElement
				| null;

			if (event.defaultPrevented) {
				return;
			}

			const [_onValidate, _onSubmit, _noValidate] = [
				onValidate(),
				onSubmit(),
				noValidate(),
			];

			try {
				const formData = getFormData(formElement, submitter);
				const submission = _onValidate({ form: formElement, formData });
				const { errors, shouldServerValidate } = Object.entries(
					submission.error,
				).reduce<{ errors: string[]; shouldServerValidate: boolean }>(
					(result, [, error]) => {
						for (const message of error) {
							if (message === VALIDATION_UNDEFINED) {
								result.shouldServerValidate = true;
							} else if (message !== VALIDATION_SKIPPED) {
								result.errors.push(message);
							}
						}

						return result;
					},
					{ errors: [], shouldServerValidate: false },
				);

				if (
					// has client validation
					typeof _onValidate !== 'undefined' &&
					// not necessary to validate on the server
					!shouldServerValidate &&
					// client validation failed or non submit intent
					((!_noValidate && !submitter?.formNoValidate && errors.length > 0) ||
						parseIntent(submission.intent) !== null)
				) {
					report(formElement, submission);
					event.preventDefault();

					_onSubmit(event, formElement, {
						formData,
						submission,
						action: getFormAction(event),
						encType: getFormEncType(event),
						method: getFormMethod(event),
					});
				} else {
					// config.onSubmit?.(event, {
					// 	formData,
					// 	submission,
					// 	action: getFormAction(nativeEvent),
					// 	encType: getFormEncType(nativeEvent),
					// 	method: getFormMethod(nativeEvent),
					// });
				}
			} catch (error) {
				// eslint-disable-next-line no-console
				console.warn('Client validation failed', error);
			}
		};

		formElement.addEventListener('submit', handleSubmit);
		onCleanup(() => formElement.removeEventListener('submit', handleSubmit));
	});

	// effect(() => {
	// 	if (_lastSubmissimnErrors) {
	//      const _lastSubmissionErrors = lastSubmissionErrors();
	// 		untracked(() => errors.set(_lastSubmissionErrors));
	// 	}
	// });

	return formsApi;
}

export function reportSubmission(
	form: HTMLFormElement,
	submission: SubmissionResult,
): void {
	for (const [name, message] of Object.entries(submission.error)) {
		// There is no need to create a placeholder button if all we want is to reset the error
		if (message.length === 0) {
			continue;
		}

		// We can't use empty string as button name
		// As `form.element.namedItem('')` will always returns null
		const elementName = name ? name : FORM_ERROR_ELEMENT_NAME;
		const item = form.elements.namedItem(elementName);

		if (item === null) {
			// Create placeholder button to keep the error without contributing to the form data
			const button = document.createElement('button');

			button.name = elementName;
			button.hidden = true;
			button.dataset['conformTouched'] = 'true';

			form.appendChild(button);
		}
	}

	const intent = parseIntent(submission.intent);
	const scope = getScope(intent);

	for (const element of getFormControls(form)) {
		const elementName =
			element.name !== FORM_ERROR_ELEMENT_NAME ? element.name : '';
		const messages = submission.error[elementName] ?? [];

		if (scope === null || scope === elementName) {
			element.dataset['conformTouched'] = 'true';
		}

		if (
			!messages.includes(VALIDATION_SKIPPED) &&
			!messages.includes(VALIDATION_UNDEFINED)
		) {
			const invalidEvent = new Event('invalid', { cancelable: true });

			element.setCustomValidity(getValidationMessage(messages));
			element.dispatchEvent(invalidEvent);
		}
	}

	if (!intent) {
		focusFirstInvalidControl(form);
	}
}

export function getScope(
	intent: ReturnType<typeof parseIntent>,
): string | null {
	switch (intent?.type) {
		case 'validate':
			return intent.payload;
		case 'list':
			return intent.payload.name;
	}

	return null;
}

const formsApi = injectForm(() => ({
	onSubmit(event, form) {},
	onValidate({ formData }) {
		return parse(formData, { schema });
	},
}));

@Directive({
	selector: 'form[ngxForm]',
	standalone: true,
})
export class NgxForm {
	@Input() ngxForm!: any;

	private renderer = inject(Renderer2);
	private formElement = inject<ElementRef<HTMLFormElement>>(ElementRef);

	constructor() {
		effect(() => {
			this.formElement.nativeElement.addEventListener('change', (event) => {
				const formElement = event.currentTarget as HTMLFormElement;
				console.dir(formElement);
			});

			this.formElement.nativeElement.addEventListener(
				'submit',
				(event: SubmitEvent) => {
					event.submitter;
				},
			);

			this.formElement.nativeElement.addEventListener('input', (event) => {
				console.log('input event', event);
			});
		});
	}
}
