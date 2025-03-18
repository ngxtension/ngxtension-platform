import { Injector, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	ControlEvent,
	FormControlStatus,
	FormGroup,
	PristineChangeEvent,
	StatusChangeEvent,
	TouchedChangeEvent,
	ValidationErrors,
	ValueChangeEvent,
} from '@angular/forms';
import {
	Observable,
	combineLatest,
	defer,
	distinctUntilChanged,
	filter,
	map,
	of,
	startWith,
	switchMap,
	throwError,
} from 'rxjs';

function valueEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is ValueChangeEvent<typeof form.value> =>
				event instanceof ValueChangeEvent,
		),
	);
}

function statusEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is StatusChangeEvent =>
				event instanceof StatusChangeEvent,
		),
	);
}

function touchedEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is TouchedChangeEvent =>
				event instanceof TouchedChangeEvent,
		),
	);
}

function pristineEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is PristineChangeEvent =>
				event instanceof PristineChangeEvent,
		),
	);
}

function errorsEvents$<T>(form: AbstractControl<T>) {
	return form.valueChanges.pipe(
		startWith(null),
		switchMap(() => {
			if (form instanceof FormGroup) {
				return of(
					Object.entries(form.controls).reduce(
						(acc: ValidationErrors, [key, control]) => {
							if (!acc[key]) {
								acc[key];
							}
							acc[key] = control.errors;
							return acc;
						},
						{},
					),
				);
			}
			if (form instanceof AbstractControl) {
				return of(form.errors);
			}
			return throwError(
				() =>
					new Error('NGXTENSION: form is not a FormGroup or AbstractControl'),
			);
		}),
	);
}

function isValueEvent<T>(
	event: ControlEvent | T,
): event is ValueChangeEvent<T> {
	return event instanceof ValueChangeEvent;
}
function isStatusEvent<T>(event: ControlEvent | T): event is StatusChangeEvent {
	return event instanceof StatusChangeEvent;
}
function isPristineEvent<T>(
	event: ControlEvent | T,
): event is PristineChangeEvent {
	return event instanceof PristineChangeEvent;
}
function isTouchedEvent<T>(
	event: ControlEvent | T,
): event is TouchedChangeEvent {
	return event instanceof TouchedChangeEvent;
}

type FormEventData<T> = {
	value: T;
	status: FormControlStatus;
	touched: boolean;
	pristine: boolean;
	valid: boolean;
	invalid: boolean;
	pending: boolean;
	dirty: boolean;
	untouched: boolean;
	controlErrors: ValidationErrors | null;
};

export function allEventsObservable<T>(
	form: AbstractControl<T>,
): Observable<FormEventData<T>>;
export function allEventsObservable<T>(
	form: AbstractControl,
): Observable<FormEventData<T>>;

export function allEventsObservable<T>(
	form: AbstractControl<T>,
): Observable<FormEventData<T>> {
	return defer(() =>
		combineLatest([
			valueEvents$(form).pipe(
				startWith(form.getRawValue()),
				map(() => form.getRawValue()),
				distinctUntilChanged(
					(previous, current) =>
						JSON.stringify(previous) === JSON.stringify(current),
				),
			),
			statusEvents$(form).pipe(startWith(form.status)),
			touchedEvents$(form).pipe(startWith(form.touched)),
			pristineEvents$(form).pipe(startWith(form.pristine)),
			errorsEvents$(form),
		]).pipe(
			map(([valueParam, statusParam, touchedParam, pristineParam, errors]) => {
				// Original values (plus value)
				const stat: FormControlStatus | StatusChangeEvent = isStatusEvent(
					statusParam,
				)
					? statusParam.status
					: statusParam;
				const touch: boolean | TouchedChangeEvent = isTouchedEvent(touchedParam)
					? touchedParam.touched
					: touchedParam;
				const prist: boolean | PristineChangeEvent = isPristineEvent(
					pristineParam,
				)
					? pristineParam.pristine
					: pristineParam;

				// Derived values - not directly named as events but are aliases for something that can be derived from original values
				const validDerived = stat === 'VALID';
				const invalidDerived = stat === 'INVALID';
				const pendingDerived = stat === 'PENDING';
				const dirtyDerived = !prist;
				const untouchedDerived = !touch;

				return {
					value: valueParam,
					status: stat,
					touched: touch,
					pristine: prist,
					valid: validDerived,
					invalid: invalidDerived,
					pending: pendingDerived,
					dirty: dirtyDerived,
					untouched: untouchedDerived,
					controlErrors: errors,
				};
			}),
		),
	);
}

export function allEventsSignal<T>(
	form: AbstractControl<T>,
	injector?: Injector,
): Signal<FormEventData<T>>;

export function allEventsSignal<T>(
	form: AbstractControl,
	injector?: Injector,
): Signal<FormEventData<T>>;

export function allEventsSignal<T>(
	form: AbstractControl<T>,
	injector?: Injector,
): Signal<FormEventData<T>> {
	return toSignal(allEventsObservable(form), {
		initialValue: {
			value: form.getRawValue(),
			status: form.status,
			pristine: form.pristine,
			touched: form.touched,
			valid: form.valid,
			invalid: form.invalid,
			pending: form.pending,
			dirty: form.dirty,
			untouched: form.untouched,
			controlErrors: form.errors,
		},
		injector: injector,
	});
}
