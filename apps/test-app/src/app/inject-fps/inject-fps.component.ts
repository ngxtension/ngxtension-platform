import { Component, ElementRef, ViewChild, effect } from '@angular/core';
import { injectFps } from 'ngxtension/inject-fps';

@Component({
	standalone: true,
	host: {
		style: 'display: block; margin: 12px',
	},
	template: `
		<div #fpsDiv></div>
	`,
})
export default class InjectFpsCmp {
	fps = injectFps();

	@ViewChild('fpsDiv', { static: true }) fpsDiv!: ElementRef<HTMLDivElement>;

	constructor() {
		effect(() => {
			this.fpsDiv.nativeElement.innerHTML = `FPS: ${this.fps()}`;
		});
	}
}
