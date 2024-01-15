import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import {
	NgxControlValueAccessor,
	provideCvaCompareToByProp,
} from 'ngxtension/control-value-accessor';

@Component({
	selector: 'custom-input',
	hostDirectives: [
		{
			directive: NgxControlValueAccessor,
			inputs: ['value', 'disabled'],
			outputs: ['valueChange'],
		},
	],
	template: `
		<label>
			<b>custom input:</b>
			<input
				type="text"
				(input)="cva.value = $any($event.target).value"
				[value]="cva.value$()"
				[disabled]="cva.disabled$()"
				(blur)="cva.markAsTouched()"
			/>
		</label>
		<label>
			<b>disabled:</b>
			<input
				type="checkbox"
				[checked]="cva.disabled$()"
				(change)="cva.disabled = $any($event.target).checked"
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

interface User {
	id: string;
	name: string;
}

@Component({
	selector: 'user-select',
	hostDirectives: [
		{
			directive: NgxControlValueAccessor,
			inputs: ['value', 'disabled'],
			outputs: ['valueChange'],
		},
	],
	template: `
		<label>
			<b>select a user:</b>
			<select
				[disabled]="cva.disabled$()"
				(blur)="cva.markAsTouched()"
				(change)="onChange($event)"
			>
				<option [selected]="cva.value === null">
					--Please select a user--
				</option>
				@for (option of options; track option.id) {
					<option [value]="option.id" [selected]="option.id === cva.value?.id">
						{{ option.name }}
					</option>
				}
			</select>
		</label>
		<label>
			<b>disabled:</b>
			<input
				type="checkbox"
				[checked]="cva.disabled$()"
				(change)="cva.disabled = $any($event.target).checked"
			/>
		</label>
	`,
	standalone: true,
	providers: [provideCvaCompareToByProp<User>('id')],
})
export class UserSelect {
	protected cva = inject<NgxControlValueAccessor<User | null>>(
		NgxControlValueAccessor,
	);

	protected onChange = (event: Event) =>
		(this.cva.value =
			this.options.find(
				({ id }) => (event.target as HTMLSelectElement).value === id,
			) ?? null);

	@Input()
	options: User[] = [];
}

@Component({
	selector: 'ngxtension-platform-control-value-accessor',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		CustomInput,
		UserSelect,
	],
	template: `
		<section>
			<h2>Without Control</h2>
			<p>
				<custom-input [(value)]="input" />
				<span>
					<b>value:</b>
					{{ input }}
				</span>
			</p>
			<p>
				<user-select [(value)]="user" [options]="users" />
				<span>
					<b>value:</b>
					{{ user | json }}
				</span>
			</p>
		</section>

		<section>
			<h2>With FormControl</h2>
			<p>
				<custom-input [formControl]="inputControl" />
				<span>
					<b>value:</b>
					{{ inputControl.value }}
				</span>
			</p>
			<p>
				<user-select [formControl]="userControl" [options]="users" />
				<span>
					<b>value:</b>
					{{ userControl.value | json }}
				</span>
			</p>
		</section>

		<section>
			<h2>With NgModel</h2>
			<p>
				<custom-input [(ngModel)]="ngModelInput" />
				<span>
					<b>value:</b>
					{{ ngModelInput }}
				</span>
			</p>
			<p>
				<user-select [(ngModel)]="ngModelUser" [options]="users" />
				<span>
					<b>value:</b>
					{{ ngModelUser | json }}
				</span>
			</p>
		</section>
	`,
})
export default class ControlValueAccessor {
	protected fb = inject(FormBuilder);

	protected users: User[] = [
		{ id: '0', name: 'Hugo' },
		{ id: '1', name: 'Peter' },
	];

	protected input = '';
	protected user = null;

	protected ngModelInput = '';
	protected ngModelUser = null;

	protected inputControl = new FormControl('');
	protected userControl = new FormControl(null);
}
