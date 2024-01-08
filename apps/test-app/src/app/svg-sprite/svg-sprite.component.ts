import { Component, Directive, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSvgSpriteFragment } from 'ngxtension/svg-sprite';

@Directive({
	selector: 'svg[faRegular]',
	standalone: true,
	hostDirectives: [
		{
			directive: NgxSvgSpriteFragment,
			inputs: ['fragment:faRegular'],
		},
	],
})
export class FaRegularDirective {
	constructor() {
		inject(NgxSvgSpriteFragment).sprite = 'fa-regular';
	}
}

@Directive({
	selector: 'svg[faSolid]',
	standalone: true,
	hostDirectives: [
		{ directive: NgxSvgSpriteFragment, inputs: ['fragment:faSolid'] },
	],
})
export class FaSolidDirective {
	constructor() {
		inject(NgxSvgSpriteFragment).sprite = 'fa-solid';
	}
}

@Directive({
	selector: 'svg[faBrand]',
	standalone: true,
	hostDirectives: [
		{ directive: NgxSvgSpriteFragment, inputs: ['fragment:faBrand'] },
	],
})
export class FaBrandDirective {
	constructor() {
		inject(NgxSvgSpriteFragment).sprite = 'fa-brands';
	}
}

@Component({
	selector: 'ngxtension-platform-svg-sprite',
	standalone: true,
	imports: [
		NgxSvgSpriteFragment,
		FaRegularDirective,
		FaSolidDirective,
		FaBrandDirective,
		ReactiveFormsModule,
	],
	template: `
		<section>
			<h2>Usage</h2>

			<svg fragment="user" sprite="fa-regular"></svg>
			<svg fragment="user" sprite="fa-solid"></svg>
			<svg fragment="house" sprite="fa-solid"></svg>
			<svg fragment="check" sprite="fa-solid"></svg>
			<svg fragment="github" sprite="fa-brands"></svg>
		</section>

		<section>
			<h2>With Composition Api</h2>

			<svg faRegular="user"></svg>
			<svg faSolid="user"></svg>
			<svg faSolid="house"></svg>
			<svg faSolid="check"></svg>
			<svg faBrand="github"></svg>
		</section>

		<section>
			<h2>Dynamic Inputs</h2>
			<svg [fragment]="form.value.fragment" [sprite]="form.value.sprite"></svg>

			<form [formGroup]="form">
				<legend>Fragment and Sprite Inputs</legend>
				<label>
					Fragment
					<input
						type="text"
						[formControl]="form.controls.fragment"
						placeholder="fragment"
					/>
				</label>
				<label>
					Sprite
					<input
						type="text"
						[formControl]="form.controls.sprite"
						placeholder="sprite"
					/>
				</label>
			</form>
		</section>

		<section>
			<h2>Disabled Auto View Box</h2>

			<svg fragment="user" sprite="fa-regular" autoViewBoxDisabled></svg>
			<svg fragment="user" sprite="fa-solid" autoViewBoxDisabled></svg>
			<svg fragment="house" sprite="fa-solid" autoViewBoxDisabled></svg>
			<svg fragment="check" sprite="fa-solid" autoViewBoxDisabled></svg>
			<svg fragment="github" sprite="fa-brands" autoViewBoxDisabled></svg>
		</section>
	`,
	styleUrl: './svg-sprite.component.css',
})
export default class SvgSpriteComponent {
	protected fb = inject(FormBuilder);

	protected form = this.fb.nonNullable.group({
		fragment: 'github',
		sprite: 'fa-brands',
	});
}
