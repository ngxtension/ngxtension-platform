import { DOCUMENT } from '@angular/common';
import {
	Directive,
	ENVIRONMENT_INITIALIZER,
	ElementRef,
	Injectable,
	Input,
	NgZone,
	booleanAttribute,
	computed,
	inject,
	makeEnvironmentProviders,
	signal,
	type OnInit,
} from '@angular/core';
import { injectAutoEffect } from 'ngxtension/auto-effect';
import { derivedFrom } from 'ngxtension/derived-from';
import {
	defer,
	map,
	of,
	pipe,
	shareReplay,
	switchMap,
	type Observable,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

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
			svg$: defer(() =>
				this.ngZone.runOutsideAngular(() =>
					ajax<SVGGraphicsElement>({
						url: sprite.baseUrl,
						responseType: 'document',
					}),
				),
			).pipe(
				map(({ response }) => {
					const svg = response.querySelector('svg');

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

export type CreateNgxSvgSpriteOptions = Omit<NgxSvgSprite, 'url'> &
	Partial<Pick<NgxSvgSprite, 'url'>>;

/**
 *
 * @param sprites
 * @returns an environment provider which registers svg sprites. The default `url` of a sprite will be `${baseUrl}#${fragment}`.
 */
export const provideSvgSprites = (...sprites: CreateNgxSvgSpriteOptions[]) =>
	makeEnvironmentProviders([
		{
			provide: ENVIRONMENT_INITIALIZER,
			multi: true,
			useFactory: () => {
				const service = inject(NgxSvgSprites);
				return () =>
					sprites.forEach((sprite) =>
						service.register(createSvgSprite(sprite)),
					);
			},
		},
	]);

/**
 * Creates a {@link NgxSvgSprite} with a default `url` builder of `${baseUrl}#${fragment}`.
 *
 * @param options
 * @returns
 */
const createSvgSprite = (options: CreateNgxSvgSpriteOptions) => {
	if (options.url == null)
		options.url = (baseUrl, fragment) => `${baseUrl}#${fragment}`;

	return options as NgxSvgSprite;
};

/**
 * A directive for rendering _symbols_ of svg sprites. It is done with the [`use`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) element.
 *
 * ## Import
 *
 * ```typescript
 * import { NgxSvgSpriteFragment } from 'ngxtension/svg-sprite';
 * ```
 *
 * ## Usage
 *
 * In this example the symbol `github` of the [fontawesome](https://fontawesome.com/) svg sprite `fa-brands` is rendered. A symbol is identified by a `fragment`. Learn more about [URLs](https://svgwg.org/svg2-draft/linking.html#URLReference).
 *
 * ```html
 * <svg fragment="github" sprite="fa-brands"></svg>
 * ```
 *
 * Without `NgxSvgSpriteFragment`:
 *
 * ```html
 * <svg viewBox="0 0 496 512">
 * 	<use href="assets/fontawesome/sprites/brands.svg#github"></use>
 * </svg>
 * ```
 *
 * ### With Directive Composition Api
 *
 * In your project you can utilize the [Directive Composition Api](https://angular.io/guide/directive-composition-api) to create specific svg sprites.
 *
 * In this example a _fontawesome brands_ svg sprite is created.
 *
 * ```html
 * <svg faBrand="github"></svg>
 * ```
 *
 * ```ts
 * @Directive({
 * 	selector: 'svg[faBrand]',
 * 	standalone: true,
 * 	hostDirectives: [
 * 		{ directive: NgxSvgSpriteFragment, inputs: ['fragment:faBrand'] },
 * 	],
 * })
 * export class FaBrandSvg {
 * 	constructor() {
 * 		inject(NgxSvgSpriteFragment).sprite = 'fa-brands';
 * 	}
 * }
 * ```
 *
 * ## Configuration
 *
 * In order to render a symbol, sprites have to be provided.
 *
 * ```ts
 * provideSvgSprites({
 * 	name: 'fa-brands',
 * 	baseUrl: 'assets/fontawesome/sprites/brands.svg',
 * });
 * ```
 *
 * The `name` property can reference any arbitrary value, but should be unique, since you can register multiple different svg sprites.
 *
 * The `sprite` input of the `NgxSvgSpriteFragment` should reference the `name` property of a provided sprite.
 *
 * ### Auto View Box
 *
 * When a symbol of an svg sprite is rendered the `viewBox` attribute or `height` and `width` _should_ be set. The `svg` element does not copy/use the `viewBox` attribute of the symbol in the svg sprite, therefore the svg will have default dimensions of 300x150 px, which is probably not preferred.
 *
 * Per default when an svg sprite is registered, the svg sprite is fetched with js in addition. `NgxSvgSpriteFragment` will copy the `viewBox` attribute of the symbol to its host.
 *
 * This behavior can be disabled.
 *
 * #### Disable via DI
 *
 * Auto View Box is disabled for the svg sprite.
 *
 * ```ts
 * provideSvgSprites({
 * 	name: 'fa-brands',
 * 	baseUrl: 'assets/fontawesome/sprites/brands.svg',
 * 	autoViewBox: false,
 * });
 * ```
 *
 * #### Disable via `autoViewBoxDisabled` Input
 *
 * Auto View Box is disabled for a `svg` element, when the `autoViewBoxDisabled` input is set to `false`.
 *
 * ```html
 * <svg fragment="github" sprite="fa-brands" autoViewBoxDisabled></svg>
 * ```
 *
 * #### Disable via `viewBox` Attribute
 *
 * Auto View Box is disabled for a `svg` element, when the `viewBox` attribute already is defined.
 *
 * ```html
 * <svg fragment="github" sprite="fa-brands" viewBox="0 0 32 32"></svg>
 * ```
 *
 * ### Classes
 *
 * When the `classes` function is set, a list of classes will be added by the `NgxSvgSpriteFragment` to its host.
 *
 * ```ts
 * provideSvgSprites({
 * 	name: 'my-sprite',
 * 	baseUrl: 'path/to/my/sprite.svg',
 * 	classes: (fragment) => ['some-class', `some-other-class-${fragment}`],
 * });
 * ```
 *
 * ### Url
 *
 * Per default when providing a sprite, the `url` will return `'${baseUrl}#${fragment}'`. This can be overwritten:
 *
 * ```ts
 * provideSvgSprites({
 * 	name: 'my-sprite',
 * 	baseUrl: 'path/to/my/sprite.svg',
 * 	url: (baseUrl, fragment) => `${baseUrl}#some-prefix-${fragment}`,
 * });
 * ```
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
	private readonly document = inject(DOCUMENT);

	/**
	 * @ignore
	 */
	private readonly autoEffect = injectAutoEffect();

	/**
	 * @ignore
	 */
	private readonly sprites = inject(NgxSvgSprites);

	/**
	 * @ignore
	 */
	public ngOnInit() {
		// Copy the 'viewBox' from the 'symbol' element in the sprite to this svg.
		// Do not launch this effect when the svg already has a 'viewBox'.
		if (!this.element.hasAttribute('viewBox'))
			this.autoEffect(() => {
				const element = this.element;
				const autoViewBox = this.autoViewBox$();
				const svg = this.svg$();
				const fragment = this.fragment$();

				if (!autoViewBox || svg == null || fragment == null) return;

				try {
					const viewBox = svg
						.querySelector(`#${fragment}`)
						?.getAttribute('viewBox');

					if (viewBox == null) return;

					element.setAttribute('viewBox', viewBox);
				} catch {
					// the querySelector could throw due to an invalid selector
				}
			});

		// Create a 'use' element which instantiates a 'symbol' element of the sprite.
		this.autoEffect(() => {
			const fragment = this.fragment$();
			const sprite = this.sprite$();
			const spriteConfig = this.spriteConfig$();
			const element = this.element;
			const document = this.document;

			let classes: string[] = [];

			if (fragment == null || sprite == null || spriteConfig == null) return;

			const useElement = document.createElementNS(element.namespaceURI, 'use');

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

			// Cleanup: clear child nodes and remove old classes of this svg.
			return () => {
				element.replaceChildren();
				element.classList.remove(...classes);
			};
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
	public readonly autoViewBoxDisabled$ = signal(false);

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
	private readonly svg$ = derivedFrom(
		{ sprite: this.spriteConfig$ },
		pipe(switchMap(({ sprite }) => sprite?.svg$ ?? of(undefined))),
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
