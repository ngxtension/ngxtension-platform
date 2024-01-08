---
title: Sprites de Svg
description: Una directiva para renderizar símbolos de sprites de svg.
entryPoint: svg-sprite
badge: stable
contributor: robby-rabbitman
---

Una directiva para renderizar _símbolos_ de sprites de svg.

## Importar

```typescript
import { NgxSvgSpriteFragment } from 'ngxtension/svg-sprite';
```

## Uso

En este ejemplo, se renderiza el símbolo `github` del sprite svg de [fontawesome](https://fontawesome.com/) llamado `fa-brands`. Un símbolo se identifica por un `fragmento`. Obtén más información sobre [URLs](https://svgwg.org/svg2-draft/linking.html#URLReference).

```html
<svg fragment="github" sprite="fa-brands"></svg>
```

Sin `NgxSvgSpriteFragment`:

```html
<svg viewBox="0 0 496 512">
	<use href="assets/fontawesome/sprites/brands.svg#github"></use>
</svg>
```

### Con la API de Composición de Directivas

En tu proyecto, puedes utilizar la [API de Composición de Directivas](https://angular.io/guide/directive-composition-api) para crear sprites de svg específicos.

En este ejemplo, se crea un sprite de svg de las _marcas de fontawesome_.

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

## Configuración

Para renderizar un símbolo, se deben proporcionar sprites.

```ts
provideSvgSprites(
	createSvgSprite({
		name: 'fa-brands',
		baseUrl: 'assets/fontawesome/sprites/brands.svg',
	}),
);
```

La propiedad `name` puede hacer referencia a cualquier valor arbitrario, pero debe ser única, ya que puedes registrar múltiples sprites de svg diferentes.

La entrada `sprite` del `NgxSvgSpriteFragment` debe hacer referencia a la propiedad `name` de un sprite proporcionado.

### Auto View Box

Cuando se renderiza un símbolo de un sprite de svg, _debería_ establecerse el atributo `viewBox` o las propiedades `height` y `width`. El elemento `svg` no copia/utiliza el atributo `viewBox` del símbolo en el sprite de svg, por lo que el svg tendrá dimensiones predeterminadas de 300x150, que probablemente no sean correctas.

Por defecto, cuando se registra un sprite de svg, se obtiene adicionalmente con js. `NgxSvgSpriteFragment` copiará el atributo `viewBox` del símbolo a su host.

Este comportamiento se puede deshabilitar.

#### Deshabilitar mediante Inyección de Dependencias (DI)

La Auto View Box está deshabilitada para el sprite de svg.

```ts
provideSvgSprites(
	createSvgSprite({
		name: 'fa-brands',
		baseUrl: 'assets/fontawesome/sprites/brands.svg',
		autoViewBox: false,
	}),
);
```

#### Deshabilitar mediante la Entrada `autoViewBoxDisabled`

La Auto View Box está deshabilitada para un elemento `svg` cuando la entrada `autoViewBoxDisabled` se establece en `false`.

```html
<svg fragment="github" sprite="fa-brands" autoViewBoxDisabled></svg>
```

#### Deshabilitar mediante el Atributo `viewBox`

La Auto View Box está deshabilitada para un elemento `svg` cuando el atributo `viewBox` ya está definido.

```html
<svg fragment="github" sprite="fa-brands" viewBox="0 0 32 32"></svg>
```

### Clases

Cuando se establece la función `classes`, se agregarán una lista de clases al `NgxSvgSpriteFragment` en su host.

```ts
provideSvgSprites(
	createSvgSprite({
		name: 'my-sprite',
		baseUrl: 'path/to/my/sprite.svg',
		classes: (fragment) => ['some-class', `some-other-class-${fragment}`],
	}),
);
```

### URL

Por defecto, al usar la función `createSvgSprite`, la `url` devolverá `'${baseUrl}#${fragment}'`. Esto se puede sobrescribir:

```ts
provideSvgSprites(
	createSvgSprite({
		name: 'my-sprite',
		baseUrl: 'path/to/my/sprite.svg',
		url: (baseUrl, fragment) => `${baseUrl}#some-prefix-${fragment}`,
	}),
);
```
