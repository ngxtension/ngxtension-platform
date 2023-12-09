import {
	ChangeDetectorRef,
	DestroyRef,
	ElementRef,
	NgZone,
	effect,
	inject,
	type Injector,
	type Type,
} from '@angular/core';
import type {
	EventTypes,
	GestureKey,
	Handler,
	UserGestureConfig,
} from '@use-gesture/vanilla';
import type { Recognizer } from '@use-gesture/vanilla/dist/declarations/src/Recognizer';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectZonelessGesture } from './zoneless-gesture';

type InjectGestureFn<
	TGestureKey extends GestureKey,
	TGestureHandler extends Handler<TGestureKey, EventTypes[TGestureKey]>,
	TGestureConfig extends UserGestureConfig[TGestureKey],
> = {
	(
		handler: (
			state: Parameters<TGestureHandler>[0] & { cdr: ChangeDetectorRef },
		) => ReturnType<TGestureHandler>,
		options?: {
			injector?: Injector;
			zoneless?: boolean;
			config?: () => TGestureConfig;
		},
	): void;
};

export type GestureInfer<TInjectGesture extends (...args: any[]) => void> =
	TInjectGesture extends InjectGestureFn<
		infer _GestureKey,
		infer _GestureHandler,
		infer GestureConfig
	>
		? {
				key: _GestureKey;
				handler: _GestureHandler;
				handlerParameters: Parameters<TInjectGesture>[0];
				state: Parameters<Parameters<TInjectGesture>[0]>[0];
				config: GestureConfig;
		  }
		: never;

export function createGesture<
	TGestureKey extends GestureKey,
	TRecognizer extends Recognizer<TGestureKey>,
>(_key: TGestureKey, gesture: Type<TRecognizer>) {
	type GestureHandler = Handler<TGestureKey, EventTypes[TGestureKey]>;
	type GestureConfig = UserGestureConfig[TGestureKey];

	return function _injectGesture(
		handler,
		{ injector, config = () => ({}), zoneless } = {},
	) {
		return assertInjector(_injectGesture, injector, () => {
			const zonelessGesture = injectZonelessGesture();
			const host = inject(ElementRef) as ElementRef<HTMLElement>;
			const zone = inject(NgZone);
			const cdr = inject(ChangeDetectorRef);

			zoneless ??= zonelessGesture;

			const ngHandler = (state: Parameters<GestureHandler>[0]) => {
				return handler(Object.assign(state, { cdr }));
			};

			const gestureInstance = zoneless
				? zone.runOutsideAngular(
						() => new gesture(host.nativeElement, ngHandler),
				  )
				: new gesture(host.nativeElement, ngHandler);

			effect(() => {
				if (zoneless) {
					zone.runOutsideAngular(() => {
						// @ts-expect-error typescript knows what the config is but gestureInstance can also set config for multiple gestures
						gestureInstance.setConfig(config());
					});
				} else {
					// @ts-expect-error typescript knows what the config is but gestureInstance can also set config for multiple gestures
					gestureInstance.setConfig(config());
				}
			});

			inject(DestroyRef).onDestroy(
				gestureInstance.destroy.bind(gestureInstance),
			);
		});
	} as InjectGestureFn<TGestureKey, GestureHandler, GestureConfig>;
}
