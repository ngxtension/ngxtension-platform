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
import { combineLatest, filter, map, startWith } from 'rxjs';

function valueEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is ValueChangeEvent<typeof form.value> =>
				event instanceof ValueChangeEvent,
		),
	);
}
// function $valueEvents<T>(form: AbstractControl<T>) {
// 	return toSignal(valueEvents$(form));
// }
function statusEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is StatusChangeEvent =>
				event instanceof StatusChangeEvent,
		),
	);
}
// function $statusEvents<T>(form: AbstractControl<T>) {
// 	return toSignal(statusEvents$(form));
// }

function touchedEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is TouchedChangeEvent =>
				event instanceof TouchedChangeEvent,
		),
	);
}

// function $touchedEvents<T>(form: AbstractControl<T>) {
// 	return toSignal(touchedEvents$(form));
// }

function pristineEvents$<T>(form: AbstractControl<T>) {
	return form.events.pipe(
		filter(
			(event: ControlEvent): event is PristineChangeEvent =>
				event instanceof PristineChangeEvent,
		),
	);
}
// function $prisineEvents<T>(form: AbstractControl<T>) {
// 	return toSignal(pristineEvents$(form));
// }

function allEvents$<T>(form: AbstractControl<T>) {
	return combineLatest([
		valueEvents$(form),
		statusEvents$(form),
		touchedEvents$(form),
		pristineEvents$(form),
	]).pipe(
		map(([value, status, touched, pristine]) => {
			return {
				value: value,
				status: status,
				touched: touched,
				pristine: pristine,
			};
		}),
	);
}
// function $allEvents<T>(form: AbstractControl<T>) {
// 	return toSignal(allEvents$(form));
// }

function allEventsValues$<T>(form: AbstractControl<T>) {
	return allEvents$(form).pipe(
		map((events) => {
			return {
				value: events.value.value,
				status: events.status.status,
				touched: events.touched.touched,
				pristine: events.pristine.pristine,
			};
		}),
	);
}
// function $allEventsValues<T>(form: AbstractControl<T>) {
// 	return toSignal(allEventsValues$(form));
// }

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
export function allEventsObservable<T>(form: AbstractControl<T>) {
	return combineLatest([
		valueEvents$(form).pipe(startWith(form.value)),
		statusEvents$(form).pipe(startWith(form.status)),
		touchedEvents$(form).pipe(startWith(form.touched)),
		pristineEvents$(form).pipe(startWith(form.pristine)),
	]).pipe(
		map(([value, status, touched, pristine]) => {
			let val: T | ValueChangeEvent<T>;
			if (isValueEvent(value)) {
				val = value.value;
			} else {
				val = value;
			}

			let stat: FormControlStatus | StatusChangeEvent;
			if (isStatusEvent(status)) {
				stat = status.status;
			} else {
				stat = status;
			}

			let touch: boolean | TouchedChangeEvent;
			if (isTouchedEvent(touched)) {
				touch = touched.touched;
			} else {
				touch = touched;
			}

			let prist: boolean | PristineChangeEvent;
			if (isPristineEvent(pristine)) {
				prist = pristine.pristine;
			} else {
				prist = pristine;
			}
			return {
				value: val,
				status: stat,
				touched: touch,
				pristine: prist,
			};
		}),
	);
}
export function allEventsSignal<T>(form: AbstractControl<T>) {
	return toSignal(allEventsObservable(form), {
		initialValue: {
			value: form.value,
			status: form.status,
			pristine: form.pristine,
			touched: form.touched,
		},
	});
}
