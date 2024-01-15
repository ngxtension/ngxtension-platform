import {
	Directive,
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

/**
 * `NgxControlValueAccessor` is a directive to reduce boilerplate when building components, which implement the [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) interface.
 *
 * ## Usage
 *
 * `NgxControlValueAccessor` implements the [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) interface and exposes a _simpler_ api. Declare `NgxControlValueAccessor` in the `hostDirectives` section of your component and inject the instance in order to wire up your template:
 *
 * - `NgxControlValueAccessor.value` for syncing the value
 * - `NgxControlValueAccessor.disabled` for syncing the disabled state
 * - `NgxControlValueAccessor.markAsTouched` for marking the view as _touched_
 *
 * The value and disabled state are also available as signals:
 *
 * - `NgxControlValueAccessor.value$`
 * - `NgxControlValueAccessor.disabled$`
 *
 * ### Example
 *
 * In this example `NgxControlValueAccessor` is used to create a `CustomInput` component.
 *
 * ```ts
 * @Component({
 *   selector: 'custom-input',
 *   hostDirectives: [NgxControlValueAccessor],
 *   template: `
 *     <label>
 *       <b>Custom label</b>
 *       <input
 *         type="text"
 *         (input)="cva.value = $event.target.value"
 *         [value]="cva.value$()"
 *         [disabled]="cva.disabled$()"
 *         (blur)="cva.markAsTouched()"
 *       />
 *     </label>
 *   `,
 *   standalone: true,
 * })
 * export class CustomInput {
 *   protected cva = inject<NgxControlValueAccessor<string>>(
 *     NgxControlValueAccessor,
 *   );
 * }
 * ```
 *
 * With usage:
 *
 * ```html
 * <custom-input [formControl]="control" />
 * <custom-input [(ngModel)]="value" />
 * ```
 *
 * ## Non Primitive Values
 *
 * When your model is a non primitive datatype, you should provide a _comparator_. It is a pure function which tells `NgxControlValueAccessor`, whether two values are _semantically_ equal:
 *
 * ```ts
 * (a, b) => boolean;
 * ```
 *
 * ### Example
 *
 * In this example `NgxControlValueAccessor` is used to create a `User` select. A `User` is identified by its `id`.
 *
 * ```ts
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * const userComparator: NgxControlValueAccessorCompareTo<User> = (a, b) =>
 *   a?.id === b?.id;
 *
 * provideCvaCompareTo(userComparator, true);
 *
 * // or
 *
 * provideCvaCompareToByProp<User>('id');
 * ```
 *
 * Full example:
 *
 * ```ts
 * @Component({
 *   selector: 'user-select',
 *   standalone: true,
 *   hostDirectives: [NgxControlValueAccessor],
 *   providers: [provideCvaCompareToByProp<User>('id')],
 *   template: `
 *     <label>
 *       <b>Select a user:</b>
 *       <select
 *         [disabled]="cva.disabled$()"
 *         (blur)="cva.markAsTouched()"
 *         (change)="onChange($event)"
 *       >
 *         <option [selected]="cva.value === null">-- no user selected --</option>
 *         @for (user of users; track user.id) {
 *           <option [value]="user.id" [selected]="user.id === cva.value?.id">
 *             {{ user.name }}
 *           </option>
 *         }
 *       </select>
 *     </label>
 *   `,
 * })
 * export class UserSelect {
 *   protected cva = inject<NgxControlValueAccessor<User | null>>(
 *     NgxControlValueAccessor,
 *   );
 *
 *   protected onChange = (event: Event) =>
 *     (this.cva.value =
 *       this.users.find(({ id }) => event.target.value === id) ?? null);
 *
 *   @Input()
 *   users: User[] = [];
 * }
 * ```
 *
 * With usage:
 *
 * ```html
 * <user-select [formControl]="userControl" [options]="users" />
 * <user-select [(ngModel)]="user" [options]="users" />
 * ```
 *
 * ## Without `NgControl`
 *
 * Optionally you can expose `inputs` and `outputs` in the `hostDirectives` declaration
 * and use it without a `NgControl` directive.
 *
 * ```ts
 * hostDirectives: [
 *   {
 *     directive: NgxControlValueAccessor,
 *     inputs: ['value'],
 *     outputs: ['valueChange'],
 *   },
 * ];
 * ```
 *
 * ```html
 * <custom-input [(value)]="value" />
 * ```
 */
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
	public markAsTouched = () => this.onTouched();

	/** This function is set by the forms api, if a control is present. */
	private onChange: (value: T) => void = noop;

	/** This function is set by the forms api, if a control is present. */
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
