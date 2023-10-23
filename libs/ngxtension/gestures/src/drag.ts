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
import { DragGesture } from '@use-gesture/vanilla';
import { createGesture, type GestureInfer } from './gesture';

export const injectDrag = createGesture('drag', DragGesture);
export type NgxInjectDrag = GestureInfer<typeof injectDrag>;

@Directive({
	selector: '[ngxDrag]',
	standalone: true,
})
export class NgxDrag implements OnInit {
	private config = signal<NgxInjectDrag['config']>({});
	@Input('ngxDragConfig') set _config(config: NgxInjectDrag['config']) {
		this.config.set(config);
	}
	@Input('ngxDragZoneless') zoneless?: boolean;
	@Output() ngxDrag = new EventEmitter<NgxInjectDrag['state']>();

	private injector = inject(Injector);

	ngOnInit(): void {
		injectDrag(this.ngxDrag.emit.bind(this.ngxDrag), {
			injector: this.injector,
			zoneless: this.zoneless,
			config: this.config,
		});
	}
}
