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
import { MoveGesture } from '@use-gesture/vanilla';
import { createGesture, type GestureInfer } from './gesture';

export const injectMove = createGesture('move', MoveGesture);
export type NgxInjectMove = GestureInfer<typeof injectMove>;

@Directive({
	selector: '[ngxMove]',
	standalone: true,
})
export class NgxMove implements OnInit {
	private config = signal<NgxInjectMove['config']>({});
	@Input('ngxMoveConfig') set _config(config: NgxInjectMove['config']) {
		this.config.set(config);
	}
	@Input('ngxMoveZoneless') zoneless?: boolean;
	@Output() ngxMove = new EventEmitter<NgxInjectMove['state']>();

	private injector = inject(Injector);

	ngOnInit(): void {
		injectMove(this.ngxMove.emit.bind(this.ngxMove), {
			injector: this.injector,
			zoneless: this.zoneless,
			config: this.config,
		});
	}
}
