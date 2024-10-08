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
	defer,
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
			map(([valueParam, statusParam, touchedParam, pristineParam]) => {
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
				};
			}),
		),
	);
}

export function allEventsSignal<T>(
	form: AbstractControl<T>,
): Signal<FormEventData<T>>;
export function allEventsSignal<T>(
	form: AbstractControl,
): Signal<FormEventData<T>>;

export function allEventsSignal<T>(
	form: AbstractControl<T>,
): Signal<FormEventData<T>> {
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
