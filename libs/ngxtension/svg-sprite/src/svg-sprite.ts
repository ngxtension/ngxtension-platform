import {
	Directive,
	ENVIRONMENT_INITIALIZER,
	ElementRef,
	Injectable,
	Injector,
	Input,
	NgZone,
	booleanAttribute,
	computed,
	effect,
	inject,
	makeEnvironmentProviders,
	runInInjectionContext,
	signal,
	type OnInit,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filterNil } from 'ngxtension/filter-nil';
import { from, map, shareReplay, switchMap, type Observable } from 'rxjs';

/**
 * Represents a svg sprite.
 *
 * @see {@link NgxSvgSpriteFragment.sprite}
 * @see {@link NgxSvgSprites.register}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use `use` Element}
 */
export interface NgxSvgSprite {
	/**
	 * A unique name identifying this sprite.
	 */
	name: string;

	/**
	 * E.g. `path/to/my/sprite.svg`
	 */
	baseUrl: string;

	/**
	 * @param baseUrl reference to this {@link baseUrl}
	 * @param fragment
	 * @returns a url pointing to a specified svg in this sprite by using a `fragment` e.g `path/to/my/sprite.svg#${fragment}`
	 *
	 * @see {@link https://svgwg.org/svg2-draft/linking.html#URLReference}
	 */
	url: (baseUrl: string, fragment: string) => string;

	/**
	 * Whether to copy the `viewBox` attribute from the `symbol` in the svg sprite.
	 */
	autoViewBox?: boolean;

	/**
	 *
	 * @param fragment
	 * @returns a list of classes that are applied to the svg element.
	 */
	classes?: (fragment: string) => string[] | string;
}

/**
 * Creates a {@link NgxSvgSprite}.
 *
 * @param sprite
 * @returns
 */
export const createSvgSprite = (
	sprite: Omit<NgxSvgSprite, 'url'> & Partial<Pick<NgxSvgSprite, 'url'>>,
) => {
	if (sprite.url == null)
		sprite.url = (baseUrl, fragment) => [baseUrl, fragment].join('#');

	return sprite as NgxSvgSprite;
};

/**
 * This service registers {@link NgxSvgSprite svg sprites}, which can be rendered via {@link NgxSvgSpriteFragment}.
 */
@Injectable({ providedIn: 'root' })
export class NgxSvgSprites {
	/**
	 * @ignore
	 */
	private readonly ngZone = inject(NgZone);

	/**
	 * <{@link NgxSvgSprite.name}, {@link NgxSvgSprite}>
	 */
	private readonly sprites: Record<
		string,
		NgxSvgSprite & { svg$: Observable<SVGGraphicsElement> }
	> = {};

	/**
	 * Registers a sprite.
	 *
	 * @param sprite
	 *
	 * @see {@link NgxSvgSpriteFragment.sprite}
	 */
	public readonly register = (sprite: NgxSvgSprite) => {
		this.sprites[sprite.name] = {
			...sprite,
			svg$: from(
				this.ngZone.runOutsideAngular(() => fetch(sprite.baseUrl)),
			).pipe(
				switchMap((response) => response.text()),
				map((text) => {
					const svg = new DOMParser()
						.parseFromString(text, 'text/xml')
						.querySelector('svg');

					if (svg == null)
						throw new Error(
							`[Svg Sprite] the url '${sprite.baseUrl}' does not seem to be a svg.`,
						);

					return svg;
				}),
				shareReplay(1),
			),
		};
	};

	/**
	 *
	 * @param name
	 * @returns a registered sprite by its name or undefined if not registered.
	 */
	public readonly get = (name: string) => this.sprites[name];
}

/**
 *
 * @param sprites
 * @returns an environment provider which registers icon sprites.
 */
export const provideSprites = (...sprites: NgxSvgSprite[]) =>
	makeEnvironmentProviders([
		{
			provide: ENVIRONMENT_INITIALIZER,
			multi: true,
			useFactory: () => {
				const service = inject(NgxSvgSprites);
				return () => sprites.forEach((sprite) => service.register(sprite));
			},
		},
	]);

/**
 * Renders a `symbol` of a {@link NgxSvgSprite svg sprite} which is identified by a `fragment`.
 */
@Directive({
	selector: 'svg[fragment]',
	standalone: true,
})
export class NgxSvgSpriteFragment implements OnInit {
	/**
	 * @ignore
	 */
	private readonly element = inject(ElementRef)
		.nativeElement as SVGGraphicsElement;

	/**
	 * @ignore
	 */
	private readonly injector = inject(Injector);

	/**
	 * @ignore
	 */
	private readonly sprites = inject(NgxSvgSprites);

	/**
	 * @ignore
	 */
	public ngOnInit() {
		runInInjectionContext(this.injector, () => {
			// Copy the 'viewBox' from the 'symbol' element in the sprite to this svg.
			effect(() => {
				const autoViewBox = this.autoViewBox$();
				const svg = this.svg$();
				const fragment = this.fragment$();
				const element = this.element;

				if (!autoViewBox || svg == null || fragment == null) return;

				const viewBox = svg
					.querySelector(`#${fragment}`)
					?.getAttribute('viewBox');

				if (viewBox == null) return;

				element.setAttribute('viewBox', viewBox);
			});

			// Create a 'use' element which instantiates a 'symbol' element of the sprite.
			effect((beforeEach) => {
				const fragment = this.fragment$();
				const sprite = this.sprite$();
				const spriteConfig = this.spriteConfig$();
				const element = this.element;

				let classes: string[] = [];

				// Clear child nodes and remove old classes of this svg.
				beforeEach(() => {
					element.replaceChildren();
					element.classList.remove(...classes);
				});

				if (fragment == null || sprite == null || spriteConfig == null) return;

				const useElement = document.createElementNS(
					element.namespaceURI,
					'use',
				);

				// Add classes when provided.
				if (spriteConfig.classes != null) {
					const _classes = spriteConfig.classes(fragment);
					classes =
						typeof _classes === 'string'
							? _classes.split(' ').filter(Boolean)
							: _classes;
					element.classList.add(...classes);
				}

				useElement.setAttribute(
					'href',
					spriteConfig.url(spriteConfig.baseUrl, fragment),
				);

				// Support old browsers. Modern browser will ignore this if they support 'href'.
				useElement.setAttribute(
					'xlink:href',
					spriteConfig.url(spriteConfig.baseUrl, fragment),
				);

				element.appendChild(useElement);
			});
		});
	}

	/**
	 * The `fragment` which identifies a `symbol` in this {@link NgxSvgSpriteFragment.sprite svg sprite}.
	 */
	public readonly fragment$ = signal<string | undefined>(undefined);

	/**
	 * The `name` of the {@link NgxSvgSprite svg sprite} this {@link NgxSvgSpriteFragment.fragment fragment} is a part of.
	 *
	 * @see {@link NgxSvgSprite.name}
	 */
	public readonly sprite$ = signal<string | undefined>(undefined);

	/**
	 * Whether `autoViewBox` is disabled.
	 *
	 * @see overrides {@link NgxSvgSprite.autoViewBox}
	 */
	public readonly autoViewBoxDisabled$ = signal<boolean>(false);

	/**
	 * @ignore
	 */
	private readonly spriteConfig$ = computed(() => {
		const sprite = this.sprite$();

		if (sprite != null) return this.sprites.get(sprite);

		return undefined;
	});

	/**
	 * @ignore
	 */
	private readonly svg$ = toSignal(
		toObservable(this.spriteConfig$).pipe(
			filterNil(),
			switchMap(({ svg$ }) => svg$),
		),
	);

	/**
	 * @ignore
	 */
	private readonly autoViewBox$ = computed(
		() =>
			!this.autoViewBoxDisabled$() &&
			(this.spriteConfig$()?.autoViewBox ?? true),
	);

	/**
	 * The `fragment` which identifies a `symbol` in this {@link NgxSvgSpriteFragment.sprite svg sprite}.
	 */
	@Input()
	public set fragment(fragment) {
		this.fragment$.set(fragment);
	}

	public get fragment() {
		return this.fragment$();
	}

	/**
	 * The `name` of the {@link NgxSvgSprite svg sprite} this {@link NgxSvgSpriteFragment.fragment fragment} is a part of.
	 *
	 * @see {@link NgxSvgSprite.name}
	 */
	@Input()
	public set sprite(sprite) {
		this.sprite$.set(sprite);
	}

	public get sprite() {
		return this.sprite$();
	}

	/**
	 * Whether `autoViewBox` is disabled.
	 *
	 * @see overrides {@link NgxSvgSprite.autoViewBox}
	 */
	@Input({ transform: booleanAttribute })
	public set autoViewBoxDisabled(autoViewBoxDisabled) {
		this.autoViewBoxDisabled$.set(autoViewBoxDisabled);
	}

	public get autoViewBoxDisabled() {
		return this.autoViewBoxDisabled$();
	}
}
