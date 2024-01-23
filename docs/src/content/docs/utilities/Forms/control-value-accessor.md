---
title: NgxControlValueAccessor
description: A directive to reduce boilerplate when building custom inputs.
entryPoint: control-value-accessor
badge: stable
contributors: ['robby-rabbitman']
---

`NgxControlValueAccessor` is a directive to reduce boilerplate when building components, which implement the [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) interface.

## Usage

`NgxControlValueAccessor` implements the [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) interface and exposes a _simpler_ api. Declare `NgxControlValueAccessor` in the `hostDirectives` section of your component and inject the instance in order to wire up your template:

- `NgxControlValueAccessor.value` for syncing the value
- `NgxControlValueAccessor.disabled` for syncing the disabled state
- `NgxControlValueAccessor.markAsTouched` for marking the view as _touched_

The value and disabled state are also available as signals:

- `NgxControlValueAccessor.value$`
- `NgxControlValueAccessor.disabled$`

### Example

In this example `NgxControlValueAccessor` is used to create a `CustomInput` component.

```ts
@Component({
	selector: 'custom-input',
	hostDirectives: [NgxControlValueAccessor],
	template: `
		<label>
			<b>Custom label</b>
			<input
				type="text"
				(input)="cva.value = $event.target.value"
				[value]="cva.value$()"
				[disabled]="cva.disabled$()"
				(blur)="cva.markAsTouched()"
			/>
		</label>
	`,
	standalone: true,
})
export class CustomInput {
	protected cva = inject<NgxControlValueAccessor<string>>(
		NgxControlValueAccessor,
	);
}
```

With usage:

```html
<custom-input [formControl]="control" />
<custom-input [(ngModel)]="value" />
```

## Non Primitive Values

When your model is a non primitive datatype, you should provide a _comparator_. It is a pure function which tells `NgxControlValueAccessor`, whether two values are _semantically_ equal:

```ts
(a, b) => boolean;
```

### Example

In this example `NgxControlValueAccessor` is used to create a `User` select. A `User` is identified by its `id`.

```ts
interface User {
	id: string;
	name: string;
}

const userComparator: NgxControlValueAccessorCompareTo<User> = (a, b) =>
	a?.id === b?.id;

provideCvaCompareTo(userComparator, true);

// or

provideCvaCompareToByProp<User>('id');
```

Full example:

```ts
@Component({
	selector: 'user-select',
	standalone: true,
	hostDirectives: [NgxControlValueAccessor],
	providers: [provideCvaCompareToByProp<User>('id')],
	template: `
		<label>
			<b>Select a user:</b>
			<select
				[disabled]="cva.disabled$()"
				(blur)="cva.markAsTouched()"
				(change)="onChange($event)"
			>
				<option [selected]="cva.value === null">-- no user selected --</option>
				@for (user of users; track user.id) {
					<option [value]="user.id" [selected]="user.id === cva.value?.id">
						{{ user.name }}
					</option>
				}
			</select>
		</label>
	`,
})
export class UserSelect {
	protected cva = inject<NgxControlValueAccessor<User | null>>(
		NgxControlValueAccessor,
	);

	protected onChange = (event: Event) =>
		(this.cva.value =
			this.users.find(({ id }) => event.target.value === id) ?? null);

	@Input()
	users: User[] = [];
}
```

With usage:

```html
<user-select [formControl]="userControl" [users]="users" />
<user-select [(ngModel)]="user" [users]="users" />
```

## Without `NgControl`

Optionally you can expose `inputs` and `outputs` in the `hostDirectives` declaration
and use it without a `NgControl` directive.

```ts
hostDirectives: [
	{
		directive: NgxControlValueAccessor,
		inputs: ['value'],
		outputs: ['valueChange'],
	},
];
```

```html
<custom-input [(value)]="value" />
```
