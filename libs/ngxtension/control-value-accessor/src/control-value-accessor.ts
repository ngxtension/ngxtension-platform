import {
	Directive,
	HostListener,
	Injector,
	Input,
	Output,
	booleanAttribute,
	inject,
	runInInjectionContext,
	signal,
	type OnInit,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgControl, NgModel, type ControlValueAccessor } from '@angular/forms';
import { createInjectionToken } from 'ngxtension/create-injection-token';
import { rxEffect } from 'ngxtension/rx-effect';
import { skip } from 'rxjs';

const noop = () => undefined;

/** @see {@link NgxControlValueAccessor.compareTo}. */
export type NgxControlValueAccessorCompareTo<T = any> = (
	a?: T,
	b?: T,
) => boolean;

export const [injectCvaCompareTo, provideCvaCompareTo] = createInjectionToken<
	() => NgxControlValueAccessorCompareTo
>(() => Object.is);

export const [injectCvaDefaultValue, provideCvaDefaultValue] =
	createInjectionToken<() => any>(() => null);

/**
 * Provides a {@link NgxControlValueAccessorCompareTo comparator} based on a property of `T`.
 *
 * @example
 * ```ts
 * interface User {
 * 	id: string;
 * 	name: string;
 * }
 *
 * provideCvaCompareToByProp<User>('id');
 * ```
 */
export const provideCvaCompareToByProp = <T>(prop: keyof T) =>
	provideCvaCompareTo((a, b) => Object.is(a?.[prop], b?.[prop]), true);

@Directive({
	standalone: true,
})
export class NgxControlValueAccessor<T = any>
	implements ControlValueAccessor, OnInit
{
	/** @ignore */
	private readonly injector = inject(Injector);

	/** @ignore */
	private readonly ngControl = inject(NgControl, {
		self: true,
		optional: true,
	});

	/** @ignore */
	public constructor() {
		if (this.ngControl != null) this.ngControl.valueAccessor = this;
	}

	/** @ignore */
	private initialValue = (): T => {
		if (this.ngControl != null) return this.ngControl.value;
		return injectCvaDefaultValue();
	};

	/** The value of this. If a control is present, it reflects it's value. */
	public readonly value$ = signal(this.initialValue(), {
		equal: (a, b) => this.compareTo(a, b),
	});

	/** Whether this is disabled. If a control is present, it reflects it's disabled state. */
	public readonly disabled$ = signal(this.ngControl?.disabled ?? false);

	/**
	 * A comparator, which determines value changes. Should return true, if two values are considered semanticly equal.
	 *
	 * Defaults to {@link Object.is} in order to align with change detection behavior for inputs.
	 */
	public readonly compareTo$ =
		signal<NgxControlValueAccessorCompareTo<T>>(injectCvaCompareTo());

	/** @ignore */
	public ngOnInit(): void {
		if (this.ngControl != null) {
			runInInjectionContext(this.injector, () => {
				// NOTE: Don't use 'effect' because we have no idea if we are setting other signals here.

				// sync value
				rxEffect(toObservable(this.value$), (value) => {
					if (!this.compareTo(this.ngControl?.value, value))
						this.onChange(value);
				});

				// sync disabled state
				rxEffect(toObservable(this.disabled$), (disabled) => {
					if (
						this.ngControl != null &&
						this.ngControl.control != null &&
						this.ngControl.disabled !== disabled
					)
						this.ngControl.control[disabled ? 'disable' : 'enable']();
				});
			});
		}
	}

	/** The value of this. If a control is present, it reflects it's value. */
	@Input()
	public set value(value: T) {
		this.value$.set(value);
	}

	public get value() {
		return this.value$();
	}

	/** Whether this is disabled. If a control is present, it reflects it's disabled state. */
	@Input({ transform: booleanAttribute })
	public set disabled(disabled: boolean) {
		this.disabled$.set(disabled);
	}

	public get disabled() {
		return this.disabled$();
	}

	/**
	 * A comparator, which determines value changes. Should return true, if two values are considered semanticly equal.
	 *
	 * Defaults to {@link Object.is} in order to align with change detection behavior for inputs.
	 */
	@Input()
	public set compareTo(compareTo) {
		if (typeof compareTo === 'function') this.compareTo$.set(compareTo);
	}

	public get compareTo() {
		return this.compareTo$();
	}

	/**
	 * Emits whenever this {@link NgxControlValueAccessor.value$ value} changes.
	 */
	@Output()
	public readonly valueChange = toObservable(this.value$).pipe(skip(1)); // -> hot observable

	/**
	 * This function should be called when this host is considered `touched`.
	 *
	 * NOTE: Whenever a `blur` event is triggered on this host, this function is called.
	 *
	 * @see {@link NgxControlValueAccessor.registerOnTouched}
	 * @see {@link NgxControlValueAccessor.ngControl}
	 */
	@HostListener('blur')
	public markAsTouched = () => this.onTouched();

	/**  This function is set by the forms api, if a control is present. */
	private onChange: (value: T) => void = noop;

	/**  This function is set by the forms api, if a control is present. */
	private onTouched: () => void = noop;

	/**
	 * `NgModel` sets up the control in `ngOnChanges`. Idk if bug or on purpose, but `writeValue` and `setDisabledState` are called before the inputs are set.
	 * {@link https://github.com/angular/angular/blob/main/packages/forms/src/directives/ng_model.ts#L223}
	 *
	 * @ignore
	 */
	private get registered() {
		return this.ngControl instanceof NgModel
			? (this.ngControl as unknown as { _registered: boolean })._registered
			: true;
	}

	// control value accessor implementation

	public writeValue = (value: T) => {
		if (this.registered) this.value = value;
	};

	public registerOnChange = (onChange: (value: T) => void) =>
		(this.onChange = onChange);

	public registerOnTouched = (onTouched: () => void) =>
		(this.onTouched = onTouched);

	public setDisabledState = (disabled: boolean) => {
		if (this.registered) this.disabled$.set(disabled);
	};
}
