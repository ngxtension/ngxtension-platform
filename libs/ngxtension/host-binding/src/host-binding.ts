/* eslint-disable @typescript-eslint/ban-types */
import {
	effect,
	ElementRef,
	HostBinding,
	inject,
	Injector,
	Renderer2,
	RendererStyleFlags2,
	runInInjectionContext,
	type Signal,
	type WritableSignal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

/**
 * `hostBinding` takes a `hostPropertyName` to attach a data property, a class, a style or an attribute (as `@HostBinding` would) to the host.
 * The udpate is applied based on the update of the provided signal (writable or not).
 *
 * @param {Required<HostBinding>['hostPropertyName']} hostPropertyName - the same property that is bound to a data property, a class, a style or an attribute as `@HostBinding`.
 * @param {Signal | WritableSignal} signal - the signal on which to react to changes to update the host, and the one that will be returned as it is
 * @returns {Signal | WritableSignal}
 *
 * @example
 * ```ts
 * export class MyComponent {
 *  readonly background = hostBinding('style.background', signal('blue'));
 *
 *  constructor() {
 *    setTimeout(() => this.background.set('red'), 3000);
 *  }
 * }
 * ```
 */
export function hostBinding<T, S extends Signal<T> | WritableSignal<T>>(
	hostPropertyName: Required<HostBinding>['hostPropertyName'],
	signal: S,
	injector?: Injector,
): S {
	injector = assertInjector(hostBinding, injector);

	runInInjectionContext(injector, () => {
		const renderer = inject(Renderer2);
		const element: HTMLElement = inject(ElementRef).nativeElement;

		effect(() => {
			let prevClasses: string[] = [];
			const value = signal();
			const [binding, property, unit] = hostPropertyName.split('.');

			switch (binding) {
				case 'style':
					renderer.setStyle(
						element,
						property,
						`${value}${unit ?? ''}`,
						property.startsWith('--')
							? RendererStyleFlags2.DashCase
							: undefined,
					);
					break;
				case 'attr':
					if (value == null) {
						renderer.removeAttribute(element, property);
					} else {
						renderer.setAttribute(element, property, String(value));
					}
					break;
				case 'class':
					if (!property) {
						if (prevClasses.length) {
							prevClasses.forEach((k) => renderer.removeClass(element, k));
						}
						prevClasses =
							typeof value === 'string' ? value.split(' ').filter(Boolean) : [];
						prevClasses.forEach((k) => renderer.addClass(element, k));
					} else {
						if (value) {
							renderer.addClass(element, property);
						} else {
							renderer.removeClass(element, property);
						}
					}
					break;
				default:
					renderer.setProperty(element, binding, value);
			}
		});
	});

	return signal;
}
