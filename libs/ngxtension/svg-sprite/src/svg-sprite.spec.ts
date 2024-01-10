import { CommonModule } from '@angular/common';
import { Component, Provider, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import {
	CreateNgxSvgSpriteOptions,
	NgxSvgSprite,
	NgxSvgSpriteFragment,
	NgxSvgSprites,
	provideSvgSprites,
} from './svg-sprite';

jest.mock('rxjs/ajax', () => ({
	...jest.requireActual('rxjs/ajax'),
	ajax: jest.fn(),
}));

describe('svg-sprite', () => {
	describe('provideSvgSprites', () => {
		const provideMockSvgSprites =
			(test: (sprites: NgxSvgSprites) => void | Promise<void>) =>
			async (...sprites: CreateNgxSvgSpriteOptions[]) => {
				TestBed.configureTestingModule({
					providers: [provideSvgSprites(...sprites)],
				});
				await TestBed.runInInjectionContext(() => test(inject(NgxSvgSprites)));
				TestBed.resetTestingModule();
			};

		it('should add a url builder which joins the baseUrl and fragment with a hashtag, when not provided', () => {
			const mockOptions1 = {
				name: 'some-sprite',
				baseUrl: '',
			} satisfies CreateNgxSvgSpriteOptions;

			const mockOptions2 = {
				name: 'some-other-sprite',
				baseUrl: 'some/other/sprite.svg',
			} satisfies CreateNgxSvgSpriteOptions;

			const mockOptions3 = {
				name: 'another-sprite',
				baseUrl: 'another/sprite.svg',
				url: (baseUrl, fragment) => `${baseUrl}#some-prefix-${fragment}`,
			} satisfies CreateNgxSvgSpriteOptions;

			provideMockSvgSprites((sprites) => {
				expect(
					sprites.get(mockOptions1.name).url(mockOptions1.baseUrl, 'foo'),
				).toEqual('#foo');

				expect(
					sprites.get(mockOptions2.name).url(mockOptions2.baseUrl, 'foo'),
				).toEqual('some/other/sprite.svg#foo');

				expect(
					sprites.get(mockOptions3.name).url(mockOptions3.baseUrl, 'foo'),
				).toEqual('another/sprite.svg#some-prefix-foo');
			})(mockOptions1, mockOptions2, mockOptions3);
		});
	});

	describe('NgxSvgSprites', () => {
		const test = (test: () => void | Promise<void>) => async () => {
			await TestBed.runInInjectionContext(test);
		};

		const mockAjax = ajax as unknown as jest.Mock;

		const nextAjax = (svgAsText: string) =>
			mockAjax.mockReturnValueOnce(
				of({
					response: new DOMParser().parseFromString(svgAsText, 'image/svg+xml'),
				}),
			);

		beforeEach(() => {
			mockAjax.mockClear();
		});

		it(
			'should be created',
			test(() => {
				expect(inject(NgxSvgSprites)).toBeTruthy();
			}),
		);

		it(
			'should register sprites',
			test(() => {
				const sprites = inject(NgxSvgSprites);

				const mockSprite1 = {
					name: 'some-sprite',
					baseUrl: 'some/sprite.svg',
					url: () => '',
				} satisfies NgxSvgSprite;

				const mockSprite2 = {
					name: 'some-other-sprite',
					baseUrl: 'some/other/sprite.svg',
					url: () => '',
				} satisfies NgxSvgSprite;

				nextAjax(`
        <svg>
          <symbol id="some-symbol" viewBox="0 0 1 2"></symbol>
        </svg>
        `);

				sprites.register(mockSprite1);

				nextAjax(`
        <svg>
          <symbol id="symbol-other-symbol" viewBox="0 0 1 2"></symbol>
        </svg>
        `);

				sprites.register(mockSprite2);

				expect(sprites.get('some-sprite')).toMatchObject(mockSprite1);
				expect(sprites.get('some-other-sprite')).toMatchObject(mockSprite2);
			}),
		);

		it(
			'should fetch svg lazily',
			test(async () => {
				const sprites = inject(NgxSvgSprites);

				const mockSprite = {
					name: 'some-sprite',
					baseUrl: 'some/sprite.svg',
					url: () => '',
				} satisfies NgxSvgSprite;

				const mockSvg = `
        <svg>
          <symbol id="some-symbol" viewBox="0 0 1 2"></symbol>
        </svg>
        `;

				nextAjax(mockSvg);

				sprites.register(mockSprite);

				expect(mockAjax).toHaveBeenCalledTimes(0);

				const svg = await firstValueFrom(sprites.get('some-sprite').svg$);

				expect(svg.querySelector('#some-symbol')).toBeTruthy();

				await firstValueFrom(sprites.get('some-sprite').svg$);
				await firstValueFrom(sprites.get('some-sprite').svg$);
				await firstValueFrom(sprites.get('some-sprite').svg$);

				expect(mockAjax).toHaveBeenCalledTimes(1);
			}),
		);
	});

	describe('NgxSvgSpriteFragment', () => {
		const provideMockSprites = () => [
			{
				provide: NgxSvgSprites,
				useValue: {
					get: (sprite) =>
						(
							({
								'some-sprite': {
									name: 'some-sprite',
									baseUrl: 'some/sprite.svg',
									url: (baseUrl, fragment) => `${baseUrl}#${fragment}`,
									classes: (fragment) => [
										'some-sprite-class',
										`some-sprite-class--${fragment}`,
									],
									svg$: of(
										new DOMParser()
											.parseFromString(
												`
                  <svg>
                    <symbol id="symbol-1" viewBox="some-sprite__symbol-1-view-box"></symbol>
                    <symbol id="symbol-2" viewBox="some-sprite__symbol-2-view-box"></symbol>
                  </svg>
                  `,
												'text/xml',
											)
											.querySelector('svg')!,
									),
								},
								'some-other-sprite': {
									name: 'some-other-sprite',
									baseUrl: 'some/other/sprite.svg',
									url: (baseUrl, fragment) => `${baseUrl}#${fragment}`,
									svg$: of(
										new DOMParser()
											.parseFromString(
												`
                  <svg>
                    <symbol id="symbol-1" viewBox="some-other-sprite__symbol-1-view-box"></symbol>
                    <symbol id="symbol-2" viewBox="some-other-sprite__symbol-2-view-box"></symbol>
                  </svg>
                  `,
												'text/xml',
											)
											.querySelector('svg')!,
									),
								},
							}) satisfies Record<
								string,
								NgxSvgSprite & {
									svg$: Observable<SVGGraphicsElement>;
								}
							>
						)[sprite]!,
				} satisfies Partial<NgxSvgSprites>,
			},
		];

		const render = (
			template: string,
			inputs?: Partial<NgxSvgSpriteFragment> | undefined,
			providers?: Provider[],
		) => {
			@Component({
				imports: [CommonModule, NgxSvgSpriteFragment],
				standalone: true,
				template,
				providers,
			})
			class Container {}

			const fixture = TestBed.createComponent(Container);

			const detectChanges = fixture.detectChanges.bind(fixture);

			fixture.detectChanges = (checkNoChanges) => {
				Object.assign(fixture.componentInstance, inputs);
				detectChanges(checkNoChanges);
			};

			fixture.detectChanges();

			const svg = fixture.debugElement
				.queryAllNodes(By.directive(NgxSvgSpriteFragment))[0]
				.injector.get(NgxSvgSpriteFragment);

			return [fixture, svg] as const;
		};

		beforeEach(() => TestBed.resetTestingModule());

		it('should be created', () => {
			const [, svg] = render(`<svg fragment></svg>`);

			expect(svg).toBeTruthy();
		});

		it('should have a fragment input', () => {
			const inputs: Partial<NgxSvgSpriteFragment> = {
				fragment: 'some-id',
			};

			const [fixture, svg] = render(
				`<svg [fragment]="fragment"></svg>`,
				inputs,
			);
			expect(svg.fragment).toEqual('some-id');

			inputs.fragment = 'some-other-id';
			fixture.detectChanges();
			expect(svg.fragment).toEqual('some-other-id');
		});

		it('should have a sprite input', () => {
			const inputs: Partial<NgxSvgSpriteFragment> = {
				sprite: 'some-sprite',
			};

			const [fixture, svg] = render(
				`<svg fragment [sprite]="sprite"></svg>`,
				inputs,
			);
			expect(svg.sprite).toEqual('some-sprite');

			inputs.sprite = 'some-other-sprite';
			fixture.detectChanges();
			expect(svg.sprite).toEqual('some-other-sprite');
		});

		it('should have a autoViewBoxDisabled input', () => {
			const inputs: Partial<NgxSvgSpriteFragment> = {
				autoViewBoxDisabled: true,
			};

			const [fixture, svg] = render(
				`<svg fragment [autoViewBoxDisabled]="autoViewBoxDisabled"></svg>`,
				inputs,
			);
			expect(svg.autoViewBoxDisabled).toEqual(true);

			inputs.autoViewBoxDisabled = false;
			fixture.detectChanges();
			expect(svg.autoViewBoxDisabled).toEqual(false);
		});

		it('should coerce the autoViewBoxDisabled input', () => {
			const [, svg] = render(`<svg fragment autoViewBoxDisabled></svg>`);
			expect(svg.autoViewBoxDisabled).toEqual(true);
		});

		it('should not disable the autoViewBox by default', () => {
			const [, svg] = render(`<svg fragment></svg>`);
			expect(svg.autoViewBoxDisabled).toEqual(false);
		});

		it('should set add a viewBox when it was already set', () => {
			const [, svg] = render(
				`<svg fragment="some-symbol" sprite="some-sprite" viewBox="shouldBeUntouched"></svg>`,
				undefined,
				provideMockSprites(),
			);

			const element = svg['element'];

			TestBed.flushEffects();

			expect(element.getAttribute('viewBox')).toEqual('shouldBeUntouched');
		});

		it('should set add a viewBox when autoViewBox is disabled', () => {
			const [fixture, svg] = render(
				`<svg fragment="symbol-1" sprite="some-sprite" autoViewBoxDisabled></svg>`,
				undefined,
				provideMockSprites(),
			);

			const element = svg['element'];

			TestBed.flushEffects();

			expect(element.hasAttribute('viewBox')).toEqual(false);

			svg.autoViewBoxDisabled = false;
			fixture.detectChanges();
			TestBed.flushEffects();
			expect(element.getAttribute('viewBox')).toEqual(
				'some-sprite__symbol-1-view-box',
			);
		});

		it('should set a viewBox when autoViewBox is enabled and a viewBox is not already set', () => {
			const inputs: Partial<NgxSvgSpriteFragment> = {
				fragment: 'symbol-1',
				sprite: 'some-sprite',
			};

			const [fixture, svg] = render(
				`<svg [fragment]="fragment" [sprite]="sprite"></svg>`,
				inputs,
				provideMockSprites(),
			);

			const element = svg['element'];

			TestBed.flushEffects();
			expect(element.getAttribute('viewBox')).toEqual(
				'some-sprite__symbol-1-view-box',
			);

			inputs.fragment = 'symbol-2';
			fixture.detectChanges();
			TestBed.flushEffects();
			expect(element.getAttribute('viewBox')).toEqual(
				'some-sprite__symbol-2-view-box',
			);

			inputs.sprite = 'some-other-sprite';
			fixture.detectChanges();
			TestBed.flushEffects();
			expect(element.getAttribute('viewBox')).toEqual(
				'some-other-sprite__symbol-2-view-box',
			);

			inputs.fragment = 'symbol-1';
			fixture.detectChanges();
			TestBed.flushEffects();
			expect(element.getAttribute('viewBox')).toEqual(
				'some-other-sprite__symbol-1-view-box',
			);
		});

		it('should create a use element inside its host', () => {
			const inputs: Partial<NgxSvgSpriteFragment> = {
				fragment: 'some-sprite__symbol-1',
				sprite: 'some-sprite',
			};

			const [fixture, svg] = render(
				`<svg [fragment]="fragment" [sprite]="sprite"></svg>`,
				inputs,
				provideMockSprites(),
			);
			const element = svg['element'];

			TestBed.flushEffects();
			let useElement = element.firstChild as SVGUseElement;
			expect(element.childElementCount).toEqual(1);
			expect(useElement.getAttribute('href')).toEqual(
				'some/sprite.svg#some-sprite__symbol-1',
			);
			expect(useElement.getAttribute('xlink:href')).toEqual(
				'some/sprite.svg#some-sprite__symbol-1',
			);

			inputs.fragment = 'some-sprite__symbol-2';
			fixture.detectChanges();
			TestBed.flushEffects();
			useElement = element.firstChild as SVGUseElement;
			expect(element.childElementCount).toEqual(1);
			expect(useElement.getAttribute('href')).toEqual(
				'some/sprite.svg#some-sprite__symbol-2',
			);
			expect(useElement.getAttribute('xlink:href')).toEqual(
				'some/sprite.svg#some-sprite__symbol-2',
			);
		});

		it('should add classes when the sprite has classes configured', () => {
			const inputs: Partial<NgxSvgSpriteFragment> = {
				fragment: 'symbol-1',
				sprite: 'some-sprite',
			};

			const [fixture, svg] = render(
				`<svg [fragment]="fragment" [sprite]="sprite"></svg>`,
				inputs,
				provideMockSprites(),
			);

			const element = svg['element'];

			TestBed.flushEffects();
			expect(element.classList.value).toEqual(
				'some-sprite-class some-sprite-class--symbol-1',
			);

			inputs.fragment = 'symbol-2';
			fixture.detectChanges();
			TestBed.flushEffects();
			expect(element.classList.value).toEqual(
				'some-sprite-class some-sprite-class--symbol-2',
			);

			inputs.sprite = 'some-other-sprite';
			fixture.detectChanges();
			TestBed.flushEffects();
			expect(element.classList.value).toEqual('');
		});
	});
});
