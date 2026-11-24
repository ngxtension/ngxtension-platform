---
title: Svg Sprites
description: A directive for rendering symbols of svg sprites.
entryPoint: ngxtension/svg-sprite
badge: stable
contributors: ['robby-rabbitman']
---

`NgxSvgSpriteFragment` renders a _symbol_ from an svg sprite by name, so you write `<svg sprite="fa-brands" fragment="github">`
instead of a `<use href="…#github">` with the full sprite URL. It adds the [`use`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)
element for you and, by default, copies the symbol's `viewBox` so the icon gets the right proportions.

## Usage

Import `NgxSvgSpriteFragment` and use it on an `svg` element. `sprite` is the name of a registered sprite (see below),
and `fragment` is the id of the symbol in that sprite. Learn more about
[fragment URLs](https://svgwg.org/svg2-draft/linking.html#URLReference).

```angular-ts
import { Component } from '@angular/core';
import { NgxSvgSpriteFragment } from 'ngxtension/svg-sprite';

@Component({
	selector: 'app-footer',
	imports: [NgxSvgSpriteFragment],
	template: `
		<a href="https://github.com/ngxtension/ngxtension-platform">
			<svg sprite="fa-brands" fragment="github" width="24" height="24"></svg>
		</a>
	`,
})
export class Footer {}
```

This renders the same as writing the `use` element by hand:

```html
<svg viewBox="0 0 496 512" width="24" height="24">
	<use href="assets/fontawesome/sprites/brands.svg#github"></use>
</svg>
```

### Register sprites

For the directive to find a sprite, register it with `provideSvgSprites` in your application (or route) providers.
Give each sprite a unique `name` and the URL of the sprite file. Pass several objects to register several sprites.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideSvgSprites } from 'ngxtension/svg-sprite';

export const appConfig: ApplicationConfig = {
	providers: [
		provideSvgSprites({
			name: 'fa-brands',
			baseUrl: 'assets/fontawesome/sprites/brands.svg',
		}),
	],
};
```

## Create an icon directive with the Directive Composition API

Use the [Directive Composition API](https://angular.dev/guide/directives/directive-composition-api) to create a
directive for one specific sprite, so templates only name the icon.

```ts
import { Directive, inject } from '@angular/core';
import { NgxSvgSpriteFragment } from 'ngxtension/svg-sprite';

@Directive({
	selector: 'svg[faBrand]',
	hostDirectives: [
		{ directive: NgxSvgSpriteFragment, inputs: ['fragment:faBrand'] },
	],
})
export class FaBrandSvg {
	constructor() {
		inject(NgxSvgSpriteFragment).sprite = 'fa-brands';
	}
}
```

```html
<svg faBrand="github"></svg>
```

## Auto view box

An `svg` element doesn't take the `viewBox` of the symbol it renders, so without a `viewBox` (or `width` and `height`)
it falls back to the default size of 300×150 px.

By default, the sprite file is also fetched with JavaScript, and `NgxSvgSpriteFragment` copies the symbol's `viewBox` to
its host `svg`. You can turn this off in three ways.

For a whole sprite, with `autoViewBox: false`:

```ts
provideSvgSprites({
	name: 'fa-brands',
	baseUrl: 'assets/fontawesome/sprites/brands.svg',
	autoViewBox: false,
});
```

For one element, with the `autoViewBoxDisabled` attribute (or `[autoViewBoxDisabled]="true"`):

```html
<svg fragment="github" sprite="fa-brands" autoViewBoxDisabled></svg>
```

For one element, by setting a `viewBox` yourself. An existing `viewBox` is never overwritten:

```html
<svg fragment="github" sprite="fa-brands" viewBox="0 0 32 32"></svg>
```

## Classes

Set `classes` to add CSS classes to every `svg` that renders a symbol of this sprite. It receives the fragment and
returns an array of classes or a space-separated string.

```ts
provideSvgSprites({
	name: 'my-sprite',
	baseUrl: 'path/to/my/sprite.svg',
	classes: (fragment) => ['icon', `icon-${fragment}`],
});
```

## Custom URL

By default the `use` element points to `${baseUrl}#${fragment}`. Set `url` when your sprite uses a different scheme:

```ts
provideSvgSprites({
	name: 'my-sprite',
	baseUrl: 'path/to/my/sprite.svg',
	url: (baseUrl, fragment) => `${baseUrl}#some-prefix-${fragment}`,
});
```

## API

```ts
function provideSvgSprites(
	...sprites: CreateNgxSvgSpriteOptions[]
): EnvironmentProviders;
```

`provideSvgSprites` returns environment providers, so use it in application or route providers, not in a component's
`providers`.

### Sprite options

| Option        | Type                                            | Default                        | Description                                                    |
| ------------- | ----------------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| `name`        | `string`                                        | -                              | Unique name of the sprite. Referenced by the `sprite` input.   |
| `baseUrl`     | `string`                                        | -                              | URL of the sprite file, for example `assets/icons/sprite.svg`. |
| `url`         | `(baseUrl: string, fragment: string) => string` | `` `${baseUrl}#${fragment}` `` | Builds the `href` of the `use` element.                        |
| `autoViewBox` | `boolean`                                       | `true`                         | Copy the symbol's `viewBox` to the host `svg`.                 |
| `classes`     | `(fragment: string) => string[] \| string`      | -                              | Classes to add to the host `svg`.                              |

### `NgxSvgSpriteFragment` (selector `svg[fragment]`)

| Input                 | Type      | Description                                                             |
| --------------------- | --------- | ----------------------------------------------------------------------- |
| `fragment`            | `string`  | Id of the symbol to render.                                             |
| `sprite`              | `string`  | `name` of a registered sprite.                                          |
| `autoViewBoxDisabled` | `boolean` | Turns off the auto view box for this element. Accepts a bare attribute. |

Registered sprites are kept in the root `NgxSvgSprites` service, which you can also inject to `register()` sprites at
runtime or `get()` one by name.
