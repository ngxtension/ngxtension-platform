import {
	Directive,
	EmbeddedViewRef,
	InjectionToken,
	Input,
	TemplateRef,
	ViewContainerRef,
	inject,
	signal,
	untracked,
	type Provider,
} from '@angular/core';
import {
	takeUntilDestroyed,
	toObservable,
	toSignal,
} from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	FormGroupDirective,
	NgForm,
	type ValidationErrors,
} from '@angular/forms';
import { filterNil } from 'ngxtension/filter-nil';
import {
	BehaviorSubject,
	Observable,
	combineLatest,
	distinctUntilChanged,
	map,
	of,
	shareReplay,
	startWith,
	switchMap,
} from 'rxjs';

export const dirty$ = (control: AbstractControl) => {
	const dirty$ = new BehaviorSubject(control.dirty);

	const markAsPristine = control.markAsPristine.bind(control);

	const markAsDirty = control.markAsDirty.bind(control);

	control.markAsPristine = (
		...args: Parameters<AbstractControl['markAsPristine']>
	) => {
		markAsPristine(...args);
		dirty$.next(false);
	};

	control.markAsDirty = (
		...args: Parameters<AbstractControl['markAsDirty']>
	) => {
		markAsDirty(...args);
		dirty$.next(true);
	};

	return dirty$.pipe(distinctUntilChanged());
};

export const touched$ = (control: AbstractControl) => {
	const touched$ = new BehaviorSubject(control.touched);

	const markAsTouched = control.markAsTouched.bind(control);

	const markAsUntouched = control.markAsUntouched.bind(control);

	control.markAsTouched = (
		...args: Parameters<AbstractControl['markAsTouched']>
	) => {
		markAsTouched(...args);
		touched$.next(true);
	};

	control.markAsUntouched = (
		...args: Parameters<AbstractControl['markAsUntouched']>
	) => {
		markAsUntouched(...args);
		touched$.next(false);
	};

	return touched$.pipe(distinctUntilChanged());
};

/**
 *  Defines when a {@link AbstractControl control} is in an *state*.
 */
export type StateMatcher = (
	control: AbstractControl,
	parent?: FormGroupDirective | NgForm,
) => Observable<boolean>;

/**
 * Emits whenever the value, status, touched/untouched state of the control changes or the parent submits.
 *
 * Evaluates to `true` when the control status is `INVALID` and it is `touched` or the parent is `submitted`.
 */
export const NGX_DEFAULT_CONTROL_ERROR_STATE_MATCHER: StateMatcher = (
	control,
	parent,
) =>
	combineLatest(
		[
			control.valueChanges.pipe(startWith(control.value)),
			control.statusChanges.pipe(
				startWith(control.status),
				distinctUntilChanged(),
			),
			touched$(control),
			parent?.ngSubmit.pipe(
				map(() => true),
				startWith(parent.submitted),
				distinctUntilChanged(),
			) ?? of(false),
		],
		(value, status, touched, submitted) =>
			status === 'INVALID' && (touched || submitted),
	);

export const NGX_CONTROL_ERROR_STATE_MATCHER = new InjectionToken<StateMatcher>(
	'NGX_CONTROL_ERROR_STATE_MATCHER',
	{ factory: () => NGX_DEFAULT_CONTROL_ERROR_STATE_MATCHER },
);

export const NGX_CONTROL_ERROR_PARENT = new InjectionToken<
	FormGroupDirective | NgForm
>('NGX_CONTROL_ERROR_PARENT');

/**
 * Configures {@link NgxControlError}.
 */
export const provideNgxControlError = (options?: {
	errorStateMatcher?: () => StateMatcher;
	parent?: () => NgForm | FormGroupDirective;
}): Provider[] => {
	const provider = [];

	if (options?.errorStateMatcher)
		provider.push({
			provide: NGX_CONTROL_ERROR_STATE_MATCHER,
			useFactory: options.errorStateMatcher,
		});

	if (options?.parent)
		provider.push({
			provide: NGX_CONTROL_ERROR_PARENT,
			useFactory: options.parent,
		});

	return provider;
};

/**
 * Represents the context of the template the {@link NgxControlError} sits on.
 */
export interface NgxControlErrorContext {
	/**
	 * Reference to the `errors` of {@link NgxControlError.control}
	 */
	$implicit: ValidationErrors;

	/**
	 * Reference to {@link NgxControlError.control}
	 */
	control: AbstractControl;

	/**
	 * Reference to {@link NgxControlError.track}
	 */
	track: string | string[];
}

/**
 * Structural directive for displaying form control errors consistently and reduce boilerplate.
 *
 * ## Usage
 *
 * ```html
 * <label>
 * 	<b>Name</b>
 * 	<input type="text" [formControl]="name" />
 * 	<strong *ngxControlError="name; track: 'required'">Name is required.</strong>
 * </label>
 * ```
 *
 * The template will be rendered, when the control is in an [_error state_](#configuration) and its errors include the tracked error(s).
 *
 * without `NgxControlError`:
 *
 * ```html
 * <label>
 * 	<b>Name</b>
 * 	<input type="text" [formControl]="name" />
 * 	@if (name.hasError('required') && (name.touched || form.submitted)) {
 * 	<strong>Name is required.</strong>
 * 	}
 * </label>
 * ```
 *
 * ## Configuration
 *
 * A `StateMatcher` defines when the provided control is in an _error state_.
 * A `StateMatcher` is a function which returns an observable. Every time the `StateMatcher` emits a value, the directive checks whether it should render or hide its template:
 * The directive renders its template when the `StateMatcher` emits `true` and the errors of the control include at least 1 tracked error, else its template will be hidden.
 *
 * ```ts
 * export type StateMatcher = (
 * control: AbstractControl,
 * parent?: FormGroupDirective | NgForm,
 * ) => Observable<boolean>;
 * ```
 *
 * Per default the control is considered in an _error state_ when 1. its status is `INVALID` and 2. it is `touched` or its form has been `submitted`.
 *
 * You can override this behavior:
 *
 * ```ts
 * //
 * // A control is in an error state when its status is invalid.
 * // Emits whenever statusChanges emits.
 * // You may want to add more sources, such as valueChanges.
 * //
 * export const customErrorStateMatcher: StateMatcher = (control) =>
 * control.statusChanges.pipe(
 * startWith(control.status),
 * map((status) => status === 'INVALID'),
 * );
 * ```
 *
 * ### Via DI
 *
 * ```ts
 * provideNgxControlError({ errorStateMatcher: customErrorStateMatcher });
 * ```
 *
 * ### Via Input
 *
 * ```html
 * <label>
 * 	<b>Name</b>
 * 	<input type="text" [formControl]="name" />
 * 	<strong *ngxControlError="name; track: 'required'; errorStateMatcher: customErrorStateMatcher">Name is required.</strong>
 * </label>
 * ```
 *
 * ## Integration
 *
 * ### [NGX Translate](https://github.com/ngx-translate/core)
 *
 * You can iterate over all possible errors and pass the `errors` to the translate pipe:
 *
 * ```html
 * <label>
 * 	<b>Mail</b>
 * 	<input type="email" [formControl]="mail" />
 * 	@for (error of ['required', 'email', 'myCustomError']; track error) {
 * 	<strong *ngxControlError="mail; track: error">{{ "PATH.TO.MAIL_CONTROL.ERRORS." + error | translate: mail.errors }}</strong>
 * 	}
 * </label>
 * ```
 *
 * ### [Angular Material](https://github.com/angular/components)
 *
 * ```html
 * <mat-form-field>
 * 	<mat-label>Name</mat-label>
 * 	<input matInput [formControl]="name" />
 * 	<mat-error *ngxControlError="name; track: 'required'">Name is required.</mat-error>
 * </mat-form-field>
 * ```
 */
@Directive({
	selector: '[ngxControlError]',
	standalone: true,
})
export class NgxControlError {
	/** @ignore */
	private readonly templateRef = inject(TemplateRef);

	/** @ignore */
	private readonly viewContainerRef = inject(ViewContainerRef);

	public constructor() {
		// Whenever one of the tracked errors are included in the controls errors and the control is in an error state, render this template.
		combineLatest(
			[toObservable(this.track$), toObservable(this.control$), this._hasError$],
			(track, control, hasError) => {
				this.viewContainerRef.clear();

				if (hasError && control != null && track != null)
					this.viewContainerRef.createEmbeddedView(this.templateRef, {
						$implicit: control.errors ?? {},
						track,
						control,
					} satisfies NgxControlErrorContext);
			},
		)
			.pipe(takeUntilDestroyed())
			.subscribe();
	}

	/**
	 * The errors this directive tracks, when a {@link control$ control} is provided.
	 */
	@Input({ alias: 'ngxControlErrorTrack', required: true })
	public set track(track) {
		this.track$.set(track);
	}

	public get track() {
		return untracked(this.track$);
	}

	/**
	 * The control which `errors` are tracked. Either a control instance or the name of the control when used in a form.
	 *
	 * @see {@link AbstractControl.errors}
	 */
	public set control(control) {
		this.control$.set(control);
	}

	public get control() {
		return untracked(this.control$);
	}

	/**
	 * The control which `errors` are tracked. Either a control instance or the name of the control when used in a form.
	 *
	 * @see {@link AbstractControl.errors}
	 */
	@Input({ alias: 'ngxControlError', required: true })
	public set controlInput(control: AbstractControl | string) {
		if (control instanceof AbstractControl) {
			this.control$.set(control);
			return;
		}

		/**
		 * TODO: throw an error if the control is not found?
		 */
		this.control$.set(this.parent$()?.control.get(control) ?? undefined);
	}

	/**
	 *  A `StateMatcher` which defines when this {@link control$ control} is in an *error state*.
	 *  This directive **ONLY** renders this template when the `StateMatcher` evaluates to `true`.
	 *
	 *  Defaults to {@link NGX_CONTROL_ERROR_STATE_MATCHER}.
	 */
	@Input({ alias: 'ngxControlErrorErrorStateMatcher' })
	public set errorStateMatcher(errorStateMatcher: StateMatcher) {
		this.errorStateMatcher$.set(errorStateMatcher);
	}

	public get errorStateMatcher() {
		return untracked(this.errorStateMatcher$);
	}

	/**
	 * The parent of this {@link control$ control}.
	 *
	 * NOTE: Might not be the control referenced by {@link AbstractControl.parent parent} of this {@link control$ control}.
	 */
	@Input({ alias: 'ngxControlErrorParent' })
	public set parent(parent) {
		this.parent$.set(parent);
	}

	public get parent() {
		return untracked(this.parent$);
	}

	/**
	 * The errors this directive tracks, when a {@link control$ control} is provided.
	 */
	public readonly track$ = signal<undefined | string | string[]>(undefined);

	/**
	 * The parent of this {@link control$ control}.
	 *
	 * NOTE: Might not be the control referenced by {@link AbstractControl.parent parent} of this {@link control$ control}.
	 */
	public readonly parent$ = signal(
		inject(NGX_CONTROL_ERROR_PARENT, { optional: true }) ??
			inject(FormGroupDirective, { optional: true }) ??
			inject(NgForm, { optional: true }) ??
			undefined,
	);

	/**
	 * The control which `errors` are tracked.
	 *
	 * @see {@link AbstractControl.errors}
	 */
	public readonly control$ = signal<AbstractControl | undefined>(undefined);

	/**
	 *  A `StateMatcher` which defines when this {@link control$ control} is in an *error state*.
	 *  This directive **ONLY** renders this template when the `StateMatcher` evaluates to `true`.
	 *
	 *  Defaults to {@link NGX_CONTROL_ERROR_STATE_MATCHER}.
	 */
	public readonly errorStateMatcher$ = signal(
		inject(NGX_CONTROL_ERROR_STATE_MATCHER),
	);

	/**
	 * The context of this template.
	 */
	public get context() {
		return (
			this.viewContainerRef.get(0) as EmbeddedViewRef<NgxControlErrorContext>
		)?.context;
	}

	/**
	 * Whether this {@link control$ control's} errors include one of the {@link track$ tracked errors} and whether it is in an *{@link errorState$ error state}*.
	 */
	private readonly _hasError$ = combineLatest([
		toObservable(this.track$),
		toObservable(this.errorStateMatcher$),
		toObservable(this.control$).pipe(filterNil()),
		toObservable(this.parent$),
	]).pipe(
		switchMap(([track, errorStateMatcher, control, parent]) =>
			errorStateMatcher(control, parent).pipe(
				map(
					(errorState) =>
						errorState &&
						track != null &&
						control != null &&
						(typeof track === 'string'
							? control.hasError(track)
							: track.some((x) => control.hasError(x))),
				),
			),
		),
		shareReplay(1), // cache the latest errorStateMatcher computation
	);

	/**
	 * Whether this {@link control$ control's} errors include one of the {@link track$ tracked errors} and whether it is in an *{@link errorState$ error state}*.
	 */
	public readonly hasError$ = toSignal(this._hasError$, {
		initialValue: false,
	});

	/** @ignore */
	public static ngTemplateContextGuard = (
		directive: NgxControlError,
		context: unknown,
	): context is NgxControlErrorContext => true;
}
