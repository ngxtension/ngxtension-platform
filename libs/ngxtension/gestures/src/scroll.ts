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
import { ScrollGesture } from '@use-gesture/vanilla';
import { createGesture, type GestureInfer } from './gesture';

export const injectScroll = createGesture('scroll', ScrollGesture);
export type NgxInjectScroll = GestureInfer<typeof injectScroll>;

@Directive({
	selector: '[ngxScroll]',
	standalone: true,
})
export class NgxScroll implements OnInit {
	private config = signal<NgxInjectScroll['config']>({});
	@Input('ngxScrollConfig') set _config(config: NgxInjectScroll['config']) {
		this.config.set(config);
	}
	@Input('ngxScrollZoneless') zoneless?: boolean;
	@Output() ngxScroll = new EventEmitter<NgxInjectScroll['state']>();

	private injector = inject(Injector);

	ngOnInit(): void {
		injectScroll(this.ngxScroll.emit.bind(this.ngxScroll), {
			injector: this.injector,
			zoneless: this.zoneless,
			config: this.config,
		});
	}
}
