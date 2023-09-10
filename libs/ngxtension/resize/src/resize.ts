import { DOCUMENT } from '@angular/common';
import {
	DestroyRef,
	Directive,
	ElementRef,
	EventEmitter,
	Input,
	NgZone,
	Output,
	inject,
	type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createInjectionToken } from 'ngxtension/create-injection-token';
import {
	Observable,
	ReplaySubject,
	debounceTime,
	fromEvent,
	pipe,
	share,
	takeUntil,
	type MonoTypeOperatorFunction,
} from 'rxjs';

export type ResizeOptions = {
	box: ResizeObserverBoxOptions;
	debounce: number | { scroll: number; resize: number };
	scroll: boolean;
	offsetSize: boolean;
	emitInZone: boolean;
	emitInitialResult: boolean;
};

export const defaultResizeOptions: ResizeOptions = {
	box: 'content-box',
	scroll: false,
	offsetSize: false,
	debounce: { scroll: 50, resize: 0 },
	emitInZone: true,
	emitInitialResult: false,
};

export const [injectResizeOptions, provideResizeOptions, NGX_RESIZE_OPTIONS] =
	createInjectionToken(() => defaultResizeOptions);

export type ResizeResult = {
	readonly entries: ReadonlyArray<ResizeObserverEntry>;
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly left: number;
	readonly dpr: number;
};

export function injectResize(
	options: Partial<ResizeOptions> = {}
): Observable<ResizeResult> {
	const [{ nativeElement }, zone, document] = [
		inject(ElementRef) as ElementRef<HTMLElement>,
		inject(NgZone),
		inject(DOCUMENT),
	];
	const mergedOptions = { ...injectResizeOptions(), ...options };
	return createResizeStream(mergedOptions, nativeElement, document, zone);
}

@Directive({ selector: '[ngxResize]', standalone: true })
export class NgxResize implements OnInit {
	@Input() ngxResizeOptions: Partial<ResizeOptions> = {};
	@Output() ngxResize = new EventEmitter<ResizeResult>();

	private host = inject(ElementRef);
	private zone = inject(NgZone);
	private document = inject(DOCUMENT);
	private resizeOptions = injectResizeOptions();
	private destroyRef = inject(DestroyRef);

	ngOnInit() {
		const mergedOptions = { ...this.resizeOptions, ...this.ngxResizeOptions };
		createResizeStream(
			mergedOptions,
			this.host.nativeElement,
			this.document,
			this.zone
		)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(this.ngxResize);
	}
}

// return ResizeResult observable
function createResizeStream(
	{
		debounce,
		scroll,
		offsetSize,
		box,
		emitInZone,
		emitInitialResult,
	}: ResizeOptions,
	nativeElement: HTMLElement,
	document: Document,
	zone: NgZone
) {
	const window = document.defaultView;
	const isSupport = !!window?.ResizeObserver;

	let observer: ResizeObserver;
	let lastBounds: Omit<ResizeResult, 'entries' | 'dpr'>;
	let lastEntries: ResizeObserverEntry[] = [];

	const torndown$ = new ReplaySubject<void>();
	const scrollContainers: HTMLOrSVGElement[] | null = findScrollContainers(
		nativeElement,
		window,
		document.body
	);

	// set actual debounce values early, so effects know if they should react accordingly
	const scrollDebounce = debounce
		? typeof debounce === 'number'
			? debounce
			: debounce.scroll
		: null;
	const resizeDebounce = debounce
		? typeof debounce === 'number'
			? debounce
			: debounce.resize
		: null;

	const debounceAndTorndown = <T>(
		debounce: number | null
	): MonoTypeOperatorFunction<T> => {
		return pipe(debounceTime(debounce ?? 0), takeUntil(torndown$));
	};

	return new Observable<ResizeResult>((subscriber) => {
		if (!isSupport) {
			subscriber.error(
				'[ngx-resize] your browser does not support ResizeObserver. Please consider using a polyfill'
			);
			return;
		}

		zone.runOutsideAngular(() => {
			if (emitInitialResult) {
				const [result] = calculateResult(nativeElement, window, offsetSize, []);
				if (emitInZone) zone.run(() => void subscriber.next(result));
				else subscriber.next(result);
			}

			const callback = (entries: ResizeObserverEntry[]) => {
				lastEntries = entries;
				const [result, size] = calculateResult(
					nativeElement,
					window,
					offsetSize,
					entries
				);

				if (emitInZone) zone.run(() => void subscriber.next(result));
				else subscriber.next(result);

				if (!areBoundsEqual(lastBounds || {}, size)) lastBounds = size;
			};

			const boundCallback = () => void callback(lastEntries);

			observer = new ResizeObserver(callback);

			observer.observe(nativeElement, { box });
			if (scroll) {
				if (scrollContainers) {
					scrollContainers.forEach((scrollContainer) => {
						fromEvent(scrollContainer as HTMLElement, 'scroll', {
							capture: true,
							passive: true,
						})
							.pipe(debounceAndTorndown(scrollDebounce))
							.subscribe(boundCallback);
					});
				}

				fromEvent(window, 'scroll', { capture: true, passive: true })
					.pipe(debounceAndTorndown(scrollDebounce))
					.subscribe(boundCallback);
			}

			fromEvent(window, 'resize')
				.pipe(debounceAndTorndown(resizeDebounce))
				.subscribe(boundCallback);
		});

		return () => {
			if (observer) {
				observer.unobserve(nativeElement);
				observer.disconnect();
			}
			torndown$.next();
			torndown$.complete();
		};
	}).pipe(
		debounceTime(scrollDebounce ?? 0),
		share({ connector: () => new ReplaySubject(1) })
	);
}

function calculateResult(
	nativeElement: HTMLElement,
	window: Window,
	offsetSize: boolean,
	entries: ResizeObserverEntry[]
): [ResizeResult, Omit<DOMRect, 'toJSON'>] {
	const { left, top, width, height, bottom, right, x, y } =
		nativeElement.getBoundingClientRect();
	const size = { left, top, width, height, bottom, right, x, y };

	if (nativeElement instanceof HTMLElement && offsetSize) {
		size.height = nativeElement.offsetHeight;
		size.width = nativeElement.offsetWidth;
	}

	Object.freeze(size);
	return [{ entries, dpr: window.devicePixelRatio, ...size }, size];
}

// Returns a list of scroll offsets
function findScrollContainers(
	element: HTMLOrSVGElement | null,
	window: Window | null,
	documentBody: HTMLElement
): HTMLOrSVGElement[] {
	const result: HTMLOrSVGElement[] = [];
	if (!element || !window || element === documentBody) return result;
	const { overflow, overflowX, overflowY } = window.getComputedStyle(
		element as HTMLElement
	);
	if (
		[overflow, overflowX, overflowY].some(
			(prop) => prop === 'auto' || prop === 'scroll'
		)
	)
		result.push(element);
	return [
		...result,
		...findScrollContainers(
			(element as HTMLElement).parentElement,
			window,
			documentBody
		),
	];
}

// Checks if element boundaries are equal
const keys: (keyof Omit<ResizeResult, 'entries' | 'dpr'>)[] = [
	'x',
	'y',
	'top',
	'bottom',
	'left',
	'right',
	'width',
	'height',
];
const areBoundsEqual = (
	a: Omit<ResizeResult, 'entries' | 'dpr'>,
	b: Omit<ResizeResult, 'entries' | 'dpr'>
) => keys.every((key) => a[key] === b[key]);
