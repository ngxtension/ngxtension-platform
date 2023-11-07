import {
	Directive,
	EventEmitter,
	Injector,
	Input,
	Output,
	inject,
	signal,
	type OnInit,
} from '@angular/core';
import { PinchGesture } from '@use-gesture/vanilla';
import { createGesture, type GestureInfer } from './gesture';

export const injectPinch = createGesture('pinch', PinchGesture);
export type NgxInjectPinch = GestureInfer<typeof injectPinch>;

@Directive({
	selector: '[ngxPinch]',
	standalone: true,
})
export class NgxPinch implements OnInit {
	private config = signal<NgxInjectPinch['config']>({});
	@Input('ngxPinchConfig') set _config(config: NgxInjectPinch['config']) {
		this.config.set(config);
	}
	@Input('ngxPinchZoneless') zoneless?: boolean;
	@Output() ngxPinch = new EventEmitter<NgxInjectPinch['state']>();

	private injector = inject(Injector);

	ngOnInit(): void {
		injectPinch(this.ngxPinch.emit.bind(this.ngxPinch), {
			injector: this.injector,
			zoneless: this.zoneless,
			config: this.config,
		});
	}
}
