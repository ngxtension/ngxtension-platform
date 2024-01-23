---
title: Svg Sprites
description: A directive for rendering symbols of svg sprites.
entryPoint: svg-sprite
badge: stable
contributors: ['robby-rabbitman']
---

A directive for rendering _symbols_ of svg sprites. It is done with the [`use`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) element.

## Import

```typescript
import { NgxSvgSpriteFragment } from 'ngxtension/svg-sprite';
```

## Usage

In this example the symbol `github` of the [fontawesome](https://fontawesome.com/) svg sprite `fa-brands` is rendered. A symbol is identified by a `fragment`. Learn more about [URLs](https://svgwg.org/svg2-draft/linking.html#URLReference).

```html
<svg fragment="github" sprite="fa-brands"></svg>
```

Without `NgxSvgSpriteFragment`:

```html
<svg viewBox="0 0 496 512">
	<use href="assets/fontawesome/sprites/brands.svg#github"></use>
</svg>
```

### With Directive Composition Api

In your project you can utilize the [Directive Composition Api](https://angular.io/guide/directive-composition-api) to create specific svg sprites.

In this example a _fontawesome brands_ svg sprite is created.

```html
<svg faBrand="github"></svg>
```

```ts
@Directive({
	selector: 'svg[faBrand]',
	standalone: true,
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

## Configuration

In order to render a symbol, sprites have to be provided.

```ts
provideSvgSprites({
	name: 'fa-brands',
	baseUrl: 'assets/fontawesome/sprites/brands.svg',
});
```

The `name` property can reference any arbitrary value, but should be unique, since you can register multiple different svg sprites.

The `sprite` input of the `NgxSvgSpriteFragment` should reference the `name` property of a provided sprite.

### Auto View Box

When a symbol of an svg sprite is rendered the `viewBox` attribute or `height` and `width` _should_ be set. The `svg` element does not copy/use the `viewBox` attribute of the symbol in the svg sprite, therefore the svg will have default dimensions of 300x150 px, which is probably not preferred.

Per default when an svg sprite is registered, the svg sprite is fetched with js in addition. `NgxSvgSpriteFragment` will copy the `viewBox` attribute of the symbol to its host.

This behavior can be disabled.

#### Disable via DI

Auto View Box is disabled for the svg sprite.

```ts
provideSvgSprites({
	name: 'fa-brands',
	baseUrl: 'assets/fontawesome/sprites/brands.svg',
	autoViewBox: false,
});
```

#### Disable via `autoViewBoxDisabled` Input

Auto View Box is disabled for a `svg` element, when the `autoViewBoxDisabled` input is set to `false`.

```html
<svg fragment="github" sprite="fa-brands" autoViewBoxDisabled></svg>
```

#### Disable via `viewBox` Attribute

Auto View Box is disabled for a `svg` element, when the `viewBox` attribute already is defined.

```html
<svg fragment="github" sprite="fa-brands" viewBox="0 0 32 32"></svg>
```

### Classes

When the `classes` function is set, a list of classes will be added by the `NgxSvgSpriteFragment` to its host.

```ts
provideSvgSprites({
	name: 'my-sprite',
	baseUrl: 'path/to/my/sprite.svg',
	classes: (fragment) => ['some-class', `some-other-class-${fragment}`],
});
```

### Url

Per default when providing a sprite, the `url` will return `'${baseUrl}#${fragment}'`. This can be overwritten:

```ts
provideSvgSprites({
	name: 'my-sprite',
	baseUrl: 'path/to/my/sprite.svg',
	url: (baseUrl, fragment) => `${baseUrl}#some-prefix-${fragment}`,
});
```
