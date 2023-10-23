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
import { WheelGesture } from '@use-gesture/vanilla';
import { createGesture, type GestureInfer } from './gesture';

export const injectWheel = createGesture('wheel', WheelGesture);
export type NgxInjectWheel = GestureInfer<typeof injectWheel>;

@Directive({
	selector: '[ngxWheel]',
	standalone: true,
})
export class NgxWheel implements OnInit {
	private config = signal<NgxInjectWheel['config']>({});
	@Input('ngxWheelConfig') set _config(config: NgxInjectWheel['config']) {
		this.config.set(config);
	}
	@Input('ngxWheelZoneless') zoneless?: boolean;
	@Output() ngxWheel = new EventEmitter<NgxInjectWheel['state']>();

	private injector = inject(Injector);

	ngOnInit(): void {
		injectWheel(this.ngxWheel.emit.bind(this.ngxWheel), {
			injector: this.injector,
			zoneless: this.zoneless,
			config: this.config,
		});
	}
}
