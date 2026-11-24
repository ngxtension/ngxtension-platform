---
title: NgxControlValueAccessor
description: A directive to reduce boilerplate when building custom inputs.
entryPoint: ngxtension/control-value-accessor
badge: stable
contributors: ['robby-rabbitman']
---

`NgxControlValueAccessor` is a host directive that implements Angular's [`ControlValueAccessor`](https://angular.dev/api/forms/ControlValueAccessor) for you. Add it to `hostDirectives`, inject it, and wire your template to a value signal, a disabled signal and a `markAsTouched()` function. Your custom input then works with `[formControl]`, `formControlName` and `[(ngModel)]`, without writing `writeValue`, `registerOnChange` or an `NG_VALUE_ACCESSOR` provider.

## Usage

```angular-ts
import { Component, inject } from '@angular/core';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';

@Component({
	selector: 'app-custom-input',
	hostDirectives: [NgxControlValueAccessor],
	template: `
		<label>
			<b>Custom label</b>
			<input
				#input
				type="text"
				[value]="cva.value$()"
				[disabled]="cva.disabled$()"
				(input)="cva.value = input.value"
				(blur)="cva.markAsTouched()"
			/>
		</label>
	`,
})
export class CustomInput {
	protected cva = inject<NgxControlValueAccessor<string>>(NgxControlValueAccessor);
}
```

Use it like any other form control:

```html
<app-custom-input [formControl]="control" />
<app-custom-input [(ngModel)]="value" />
```

From the injected directive you use:

- `value$` and `disabled$`: signals that reflect the control's value and disabled state.
- `value = x`: sets the value and notifies the form control.
- `markAsTouched()`: marks the control as touched; call it on `blur`.

## Object values

For objects, tell `NgxControlValueAccessor` when two values are the same with a comparator `(a, b) => boolean`. Without one, values are compared with `Object.is`, so a new object with the same content counts as a change.

```ts
interface User {
	id: string;
	name: string;
}

const userComparator: NgxControlValueAccessorCompareTo<User> = (a, b) =>
	a?.id === b?.id;

provideCvaCompareTo(userComparator, true);

// or, when one property identifies the object
provideCvaCompareToByProp<User>('id');
```

The second argument `true` of `provideCvaCompareTo` tells it that the function is the value, not a factory that returns the value.

Here is a user select that compares users by `id`:

```angular-ts
import { Component, inject, input } from '@angular/core';
import {
	NgxControlValueAccessor,
	provideCvaCompareToByProp,
} from 'ngxtension/control-value-accessor';

@Component({
	selector: 'app-user-select',
	hostDirectives: [NgxControlValueAccessor],
	providers: [provideCvaCompareToByProp<User>('id')],
	template: `
		<label>
			<b>Select a user:</b>
			<select
				#select
				[disabled]="cva.disabled$()"
				(change)="selectUser(select.value)"
				(blur)="cva.markAsTouched()"
			>
				<option value="" [selected]="cva.value$() === null">-- no user selected --</option>
				@for (user of users(); track user.id) {
					<option [value]="user.id" [selected]="user.id === cva.value$()?.id">
						{{ user.name }}
					</option>
				}
			</select>
		</label>
	`,
})
export class UserSelect {
	protected cva = inject<NgxControlValueAccessor<User | null>>(NgxControlValueAccessor);

	users = input<User[]>([]);

	protected selectUser(id: string) {
		this.cva.value = this.users().find((user) => user.id === id) ?? null;
	}
}
```

```html
<app-user-select [formControl]="userControl" [users]="users" />
<app-user-select [(ngModel)]="user" [users]="users" />
```

## Without a form control

To use the component without `[formControl]` or `[(ngModel)]`, expose the directive's `value` input and `valueChange` output in `hostDirectives`:

```ts
@Component({
	selector: 'app-custom-input',
	hostDirectives: [
		{
			directive: NgxControlValueAccessor,
			inputs: ['value'],
			outputs: ['valueChange'],
		},
	],
	template: `
		...
	`,
})
export class CustomInput {}
```

```html
<app-custom-input [(value)]="value" />
```

You can expose `disabled` and `compareTo` the same way.

## Transform incoming values

A `transform` function is applied to every value the form writes into your component (it intercepts `writeValue`). Call it yourself in the template if values typed by the user should be transformed too. This uppercase input does both:

```angular-ts
import { Component, inject } from '@angular/core';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';

@Component({
	selector: 'app-uppercase-input',
	hostDirectives: [NgxControlValueAccessor],
	template: `
		<input
			#input
			type="text"
			[value]="cva.value$()"
			[disabled]="cva.disabled$()"
			(input)="cva.value = cva.transform(input.value)"
			(blur)="cva.markAsTouched()"
		/>
	`,
})
export class UppercaseInput {
	protected cva = inject<NgxControlValueAccessor<string>>(NgxControlValueAccessor);

	constructor() {
		this.cva.transform = (value: string) => value.toUpperCase();
	}
}
```

You can also provide it with DI:

```ts
providers: [provideCvaTransform((value: string) => value.toUpperCase(), true)];
```

## Default value

Without a form control, the initial value is `null`. Change it with `provideCvaDefaultValue`:

```ts
providers: [provideCvaDefaultValue('')];
```

## API

### `NgxControlValueAccessor<T>`

| Member            | Type                                   | Description                                                                      |
| ----------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| `value$`          | `WritableSignal<T>`                    | The current value. Reflects the form control's value when there is one.          |
| `value`           | `T` (getter/setter, `@Input`)          | Read or set the value. Setting it notifies the form control.                     |
| `disabled$`       | `WritableSignal<boolean>`              | Whether the control is disabled.                                                 |
| `disabled`        | `boolean` (getter/setter, `@Input`)    | Read or set the disabled state. Setting it enables or disables the form control. |
| `compareTo`       | `(a?: T, b?: T) => boolean` (`@Input`) | Decides whether two values are equal. Defaults to `Object.is`.                   |
| `valueChange`     | `Observable<T>` (`@Output`)            | Emits when the value changes.                                                    |
| `markAsTouched()` | `() => void`                           | Marks the form control as touched.                                               |
| `transform`       | `(value: any) => T`                    | Applied to values written by the form. Defaults to identity.                     |
| `ngControl`       | `NgControl \| null`                    | The `NgControl` on the host element, if any.                                     |

### Providers

```ts
provideCvaCompareTo(compareTo: NgxControlValueAccessorCompareTo, isFunctionValue: true);
provideCvaCompareToByProp<T>(prop: keyof T);
provideCvaTransform(transform: NgxControlValueAccessorTransform, isFunctionValue: true);
provideCvaDefaultValue(value: any);
```

Each provider function is created with [`createInjectionToken`](/utilities/dependency-injection/create-injection-token/). Pass `true` as the second argument when you provide the function itself, as in the examples above.
