import {
	Component,
	HostListener,
	inject,
	signal,
	type WritableSignal,
} from '@angular/core';
import type { Vector2 } from '@use-gesture/vanilla';
import {
	NgxDrag,
	injectDrag,
	provideZonelessGesture,
	type NgxInjectDrag,
} from 'ngxtension/gestures';

const dragHandler = (from: WritableSignal<Vector2>) => {
	return ({
		target,
		active,
		offset: [ox, oy],
		cdr,
	}: NgxInjectDrag['state']) => {
		const el = target as HTMLElement;
		from.set([ox, oy]);
		el.style.transform = `translate(${ox}px, ${oy}px)`;
		if (!active) {
			cdr.detectChanges();
		}
	};
};

@Component({
	selector: 'app-box-with-host',
	standalone: true,
	template: `
		<span style="position: absolute; top: -1rem; ">host directive</span>
	`,
	host: {
		class: 'draggable-box green-draggable-box',
	},
	hostDirectives: [{ directive: NgxDrag, outputs: ['ngxDrag'] }],
})
export class BoxWithHost {
	from = signal<Vector2>([0, 0]);

	@HostListener('ngxDrag', ['$event'])
	onDrag = dragHandler(this.from);

	constructor() {
		inject(NgxDrag, { host: true })._config = { from: this.from };
	}
}

@Component({
	selector: 'app-box',
	standalone: true,
	template: `
		<span style="position: absolute; top: -1rem; ">
			{{ from() }}
		</span>
	`,
	host: {
		class: 'draggable-box pink-draggable-box',
	},
})
export class Box {
	from = signal<Vector2>([0, 0]);
	constructor() {
		injectDrag(dragHandler(this.from), { config: () => ({ from: this.from }) });
	}
}

@Component({
	standalone: true,
	imports: [Box, BoxWithHost, NgxDrag],
	template: `
		<app-box />
		<app-box-with-host />
		<div
			class="draggable-box blue-draggable-box"
			(ngxDrag)="onDrag($event)"
			[ngxDragConfig]="{ from }"
		></div>
	`,
	providers: [provideZonelessGesture()],
})
export default class Drag {
	from = signal<Vector2>([0, 0]);
	onDrag = dragHandler(this.from);
}
