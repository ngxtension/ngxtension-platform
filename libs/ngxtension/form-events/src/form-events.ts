import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	ControlEvent,
	FormControlStatus,
	PristineChangeEvent,
	StatusChangeEvent,
	TouchedChangeEvent,
	ValueChangeEvent,
} from '@angular/forms';
import {
	Observable,
	combineLatest,
	distinctUntilChanged,
	filter,
	map,
	startWith,
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
export function allEventsObservable<T>(form: AbstractControl<T>): Observable<{
	value: T;
	status: FormControlStatus;
	touched: boolean;
	pristine: boolean;
	valid: boolean;
	invalid: boolean;
	pending: boolean;
	dirty: boolean;
	untouched: boolean;
}> {
	return combineLatest([
		valueEvents$(form).pipe(
			startWith(form.value),
			map((value) => (isValueEvent(value) ? value.value : value)),
			distinctUntilChanged(
				(previous, current) =>
					JSON.stringify(previous) === JSON.stringify(current),
			),
		),
		statusEvents$(form).pipe(startWith(form.status)),
		touchedEvents$(form).pipe(startWith(form.touched)),
		pristineEvents$(form).pipe(startWith(form.pristine)),
	]).pipe(
		map(([value, status, touched, pristine]) => {
			// Original values (plus value)
			const stat: FormControlStatus | StatusChangeEvent = isStatusEvent(status)
				? status.status
				: status;
			const touch: boolean | TouchedChangeEvent = isTouchedEvent(touched)
				? touched.touched
				: touched;
			const prist: boolean | PristineChangeEvent = isPristineEvent(pristine)
				? pristine.pristine
				: pristine;

			// Derived values - not directly named as events but are aliases for something that can be derived from original values
			const valid = stat === 'VALID';
			const invalid = stat === 'INVALID';
			const pending = stat === 'PENDING';
			const dirty = !prist;
			const untouched = !touch;

			return {
				value: value,
				status: stat,
				touched: touch,
				pristine: prist,
				valid: valid,
				invalid: invalid,
				pending: pending,
				dirty: dirty,
				untouched: untouched,
			};
		}),
	);
}
export function allEventsSignal<T>(form: AbstractControl<T>): Signal<{
	value: T;
	status: FormControlStatus;
	touched: boolean;
	pristine: boolean;
	valid: boolean;
	invalid: boolean;
	pending: boolean;
	dirty: boolean;
	untouched: boolean;
}> {
	return toSignal(allEventsObservable(form), {
		initialValue: {
			value: form.value,
			status: form.status,
			pristine: form.pristine,
			touched: form.touched,
			valid: form.valid,
			invalid: form.invalid,
			pending: form.pending,
			dirty: form.dirty,
			untouched: form.untouched,
		},
	});
}
