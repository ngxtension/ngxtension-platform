import {
	ChangeDetectorRef,
	DestroyRef,
	Directive,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	NgZone,
	Output,
	effect,
	inject,
	runInInjectionContext,
	signal,
	type OnInit,
} from '@angular/core';
import {
	DragGesture,
	type DragConfig,
	type DragState,
	type EventTypes,
	type Handler,
} from '@use-gesture/vanilla';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectZonelessGesture } from './zoneless-gesture';

type DragHandler = Handler<'drag', EventTypes['drag']>;
export type NgxDragState = Parameters<DragHandler>[0] & {
	cdr: ChangeDetectorRef;
};
type NgxDragHandler = (state: NgxDragState) => ReturnType<DragHandler>;

export function injectDrag(
	handler: NgxDragHandler,
	{
		injector,
		zoneless,
		config = () => ({}),
	}: { injector?: Injector; zoneless?: boolean; config?: () => DragConfig } = {}
) {
	injector = assertInjector(injectDrag, injector);
	return runInInjectionContext(injector, () => {
		const zonelessGesture = injectZonelessGesture();
		const host = inject(ElementRef) as ElementRef<HTMLElement>;
		const zone = inject(NgZone);
		const cdr = inject(ChangeDetectorRef);

		zoneless ??= zonelessGesture;

		const ngHandler = (state: DragState) => {
			return handler(Object.assign(state, { cdr }) as NgxDragState);
		};

		const dragGesture = zoneless
			? zone.runOutsideAngular(
					() => new DragGesture(host.nativeElement, ngHandler)
			  )
			: new DragGesture(host.nativeElement, ngHandler);

		effect(() => {
			if (zoneless) {
				zone.runOutsideAngular(() => {
					dragGesture.setConfig(config());
				});
			} else {
				dragGesture.setConfig(config());
			}
		});

		inject(DestroyRef).onDestroy(dragGesture.destroy.bind(dragGesture));
	});
}

@Directive({
	selector: '[ngxDrag]',
	standalone: true,
})
export class NgxDrag implements OnInit {
	private config = signal<DragConfig>({});
	@Input('ngxDragConfig') set _config(config: DragConfig) {
		this.config.set(config);
	}
	@Input('ngxDragZoneless') zoneless?: boolean;
	@Output() ngxDrag = new EventEmitter<NgxDragState>();

	private injector = inject(Injector);

	ngOnInit(): void {
		injectDrag(this.ngxDrag.emit.bind(this.ngxDrag), {
			injector: this.injector,
			zoneless: this.zoneless,
			config: this.config,
		});
	}
}
