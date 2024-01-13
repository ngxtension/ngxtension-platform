import { Component, inject } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import { MixinControlValueAccessor } from 'ngxtension/control-value-accessor';

@Component({
	selector: 'custom-input',
	hostDirectives: [
		{
			directive: MixinControlValueAccessor,
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
		<span>
			<b>value:</b>
			{{ cva.value$() }}
		</span>
	`,
	standalone: true,
})
export class CustomInput {
	protected cva = inject(MixinControlValueAccessor);
}

@Component({
	selector: 'ngxtension-platform-control-value-accessor',
	standalone: true,
	imports: [FormsModule, ReactiveFormsModule, CustomInput],
	template: `
		<section>
			<h2>Without Control</h2>
			<custom-input [(value)]="value" />
		</section>

		<section>
			<h2>With FormControl</h2>
			<custom-input [formControl]="control" />
		</section>

		<section>
			<h2>With NgModel</h2>
			<custom-input [(ngModel)]="ngModelvalue" />
		</section>
	`,
})
export default class ControlValueAccessor {
	protected fb = inject(FormBuilder);

	protected value = 'some value';

	protected ngModelvalue = 'some value';

	protected control = new FormControl('some value');
}
