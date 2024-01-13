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
import { NgControl, type ControlValueAccessor } from '@angular/forms';
import { rxEffect } from 'ngxtension/rx-effect';
import { skip } from 'rxjs';

const noop = () => undefined;

@Directive({
	standalone: true,
})
export class MixinControlValueAccessor<T>
	implements ControlValueAccessor, OnInit
{
	/** @ignore */
	private readonly injector = inject(Injector);

	/** @ignore */
	private readonly ngControl = inject(NgControl, {
		self: true,
		optional: true,
	});

	public constructor() {
		if (this.ngControl != null) this.ngControl.valueAccessor = this;
	}

	/** The value of this mixin. If a control is present, it reflects it's value. */
	public readonly value$ = signal(null as T, {
		equal: (a, b) => this.compareTo(a, b),
	});

	/** Whether this mixin is disabled. If a control is present, it reflects it's disabled state. */
	public readonly disabled$ = signal(this.ngControl?.disabled ?? false);

	/**
	 * A comparator, which determines value changes. Should return true, if two values are considered semanticly equal.
	 *
	 * Defaults to {@link Object.is} in order to align with change detection behavior for inputs.
	 */
	public readonly compareTo$ = signal<(a?: T, b?: T) => boolean>(Object.is);

	/** @ignore */
	public ngOnInit(): void {
		if (this.ngControl != null) {
			runInInjectionContext(this.injector, () => {
				// NOTE: Don't use signal effects here because we have no idea if we are setting other signals here.

				// sync value
				rxEffect(toObservable(this.value$), (value) => {
					if (this.compareTo(this.ngControl?.value, value))
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

	/** The value of this mixin. If a control is present, it reflects it's value. */
	@Input()
	public set value(value: T) {
		this.value$.set(value);
	}

	public get value() {
		return this.value$();
	}

	/** Whether this mixin is disabled. If a control is present, it reflects it's disabled state. */
	@Input({ transform: booleanAttribute })
	public set disabled(disabled: boolean) {
		this.disabled$.set(disabled);
	}

	/**
	 * A comparator, which determines value changes. Should return true, if two values are considered semanticly equal.
	 *
	 * Defaults to {@link Object.is} in order to align with change detection behavior for inputs.
	 */
	@Input()
	public set compareTo(compareTo: (a?: T, b?: T) => boolean) {
		if (typeof compareTo === 'function') this.compareTo$.set(compareTo);
	}

	public get compareTo() {
		return this.compareTo$();
	}

	/**
	 * Emits whenever this {@link MixinControlValueAccessor.value$ value} changes.
	 */
	@Output()
	public readonly valueChange = toObservable(this.value$).pipe(skip(1)); // -> hot observable

	/**
	 * This function should be called when this host is considered `touched`.
	 *
	 * NOTE: Whenever a `blur` event is triggered on this host, this function is called.
	 *
	 * @see {@link MixinControlValueAccessor.registerOnTouched}
	 * @see {@link MixinControlValueAccessor.ngControl}
	 */
	@HostListener('blur')
	public markAsTouched = () => this.onTouched();

	/**  This function is set by the forms api, if a control is present. */
	private onChange: (value: T) => void = noop;

	/**  This function is set by the forms api, if a control is present. */
	private onTouched: () => void = noop;

	// control value accessor implementation

	public writeValue = (value: T) => (this.value = value);

	public registerOnChange = (onChange: (value: T) => void) =>
		(this.onChange = onChange);

	public registerOnTouched = (onTouched: () => void) =>
		(this.onTouched = onTouched);

	public setDisabledState = (disabled: boolean) => this.disabled$.set(disabled);
}
