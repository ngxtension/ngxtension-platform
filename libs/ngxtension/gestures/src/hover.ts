import {
	Directive,
	Injector,
	Input,
	inject,
	output,
	signal,
	type OnInit,
} from '@angular/core';
import { HoverGesture } from '@use-gesture/vanilla';
import { createGesture, type GestureInfer } from './gesture';

export const injectHover = createGesture('hover', HoverGesture);
export type NgxInjectHover = GestureInfer<typeof injectHover>;

@Directive({
	selector: '[ngxHover]',
	standalone: true,
})
export class NgxHover implements OnInit {
	private config = signal<NgxInjectHover['config']>({});
	@Input('ngxHoverConfig') set _config(config: NgxInjectHover['config']) {
		this.config.set(config);
	}
	@Input('ngxHoverZoneless') zoneless?: boolean;
	readonly ngxHover = output<NgxInjectHover['state']>();

	private injector = inject(Injector);

	ngOnInit(): void {
		injectHover(this.ngxHover.emit.bind(this.ngxHover), {
			injector: this.injector,
			zoneless: this.zoneless,
			config: this.config,
		});
	}
}
