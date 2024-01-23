---
title: Intl
description: Utilidades adicionales de Intl para formatear números, strings y otros objetos.
badge: stable
entryPoint: intl
contributors: ['ion-prodan']
---

Esto es una colección de pipes diseñados para aplicaciones Angular que aprovechan la [API Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

Aunque no está pensado para reemplazar completamente los pipes estándar de Angular para `currency`, `date` y `number`, sirve como un kit de herramientas complementario para mejorar las funcionalidades existentes.

El locale por defecto se determina mediante el token [`LOCALE_ID`](https://angular.io/api/core/LOCALE_ID). Al alterar esto se cambiará el locale para todos los pipes incluidos.

Como alternativa, puedes especificar el locale directamente como **último parámetro de cualquier pipe, anulando así la configuración por defecto**.

Estos pipes utilizan la API Intl. En los casos en los que la API Intl no esté disponible, los pipes recurrirán automáticamente a métodos alternativos, variando según el pipe específico que se esté utilizando.

Por ejemplo, [`DisplayNamesPipe`](#displaynamespipe) procesa el valor de código que se le pasa, mientras que [`ListFormatPipe`](#listformatpipe) muestra los valores de la lista como un string.

De surgir algún problema, se mostrará un mensaje de error en la consola para proporcionar más información.

## DisplayNamesPipe

Muestra el nombre localizado del valor de código para el tipo especificado.

Por ejemplo, el nombre localizado del código de idioma "en" en inglés es "English", y en alemán es "Englisch".

### Uso

Importa `DisplayNamesPipe` y añádelo a tu componente:

```ts
import {Component} from "@angular/core";
import {DisplayNamesPipe} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DisplayNamesPipe],
  template: `
    <p>{{ 'en' | displayNames: 'language' }}</p>
  `
})
```

If `LOCALE_ID` is set to `en-US`, the above example will display `English`, while if it's set to `de-DE`, it will display `Englisch`.
Si `LOCALE_ID` está establecido a `en-US`, el ejemplo anterior mostrará `English`, mientras que si está establecido a `de-DE`, mostrará `Englisch`.

Además, puedes **enviar el estilo y el locale como parámetros**:

```html
<p>{{ 'en' | displayNames: 'language' : 'long' : 'de' }}</p>
```

El ejemplo anterior mostrará `Englisch` en el locale alemán, independientemente de lo que esté establecido en `LOCALE_ID`.

### Configuración

Para explorar opciones de configuración adicionales, puedes personalizar el `DisplayNamesPipe` modificando las opciones por defecto a través del proveedor `provideDisplayNamesOptions`:

```ts
import {Component} from "@angular/core";
import {DisplayNamesPipe, provideDisplayNamesOptions} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DisplayNamesPipe],
  providers: [
    provideDisplayNamesOptions({
      localeMatcher: 'best fit',
      style: 'long',
    })
  ],
  template: `
    <p>{{ 'en' | displayNames }}</p>
  `
})
```

La configuración por defecto es:

```ts
const defaultOptions: DisplayNamesOptions = {
	style: 'short',
	localeMatcher: 'lookup',
	fallback: 'code',
};
```

Para más información, consulta la [API DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames).

### Manejo de errores

Si se produce un error, el pipe devolverá el valor que se le envió, y se mostrará un error en la consola con más detalles.

`{{ 'any-nonvalid-value' | displayNames: 'language' }}` devolverá `any-nonvalid-value`.

## ListFormatPipe

Muestra la representación localizada de un string de elementos.

Por ejemplo, la lista `['en', 'fr', 'de']` se mostrará como `en, fr, and de` en inglés, y `en, fr et de` en francés.

### Uso

Importa `ListFormatPipe` y añádelo a tu componente:

```ts
import {Component} from "@angular/core";
import {ListFormatPipe} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListFormatPipe],
  template: `
    <p>{{ ['en', 'fr', 'de'] | listFormat }}</p>
  `
})
```

Si `LOCALE_ID` está establecido a `en-US`, el ejemplo anterior mostrará `en, fr, and de`, mientras que si está establecido a `fr-FR`, mostrará `en, fr et de`.

Además, puedes **enviar el estilo y el locale como parámetros**:

```html
<p>{{ ['en', 'fr', 'de'] | listFormat : 'long' : 'fr' }}</p>
```

El ejemplo anterior mostrará `en, fr et de` en el locale francés, independientemente de lo que esté establecido en `LOCALE_ID`.

### Configuración

Para explorar opciones de configuración adicionales, puedes personalizar el `ListFormatPipe` modificando las opciones por defecto a través del proveedor `provideListFormatOptions`:

```ts
import {Component} from "@angular/core";
import {ListFormatPipe, provideListFormatOptions} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListFormatPipe],
  providers: [
    provideListFormatOptions({
      style: 'short',
      type: 'conjunction',
    })
  ],
  template: `
    <p>{{ ['en', 'fr', 'de'] | listFormat }}</p>
  `
})
```

La configuración por defecto es:

```ts
const defaultOptions: ListFormatOptions = {
	style: 'long',
	type: 'conjunction',
};
```

Para más información, consulta la [API ListFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat).

### Manejo de errores

Si se produce un error, el pipe devolverá el valor del array como string, y se mostrará un error en la consola con más detalles.

`{{ ['en', 'fr', 'de'] | listFormat }}` devolverá `en, fr, de`.

## PluralRulesPipe

Muestra la representación localizada de un valor plural.

Por ejemplo, el valor `1` se mostrará como `one` en inglés, y `uno` en español.

### Uso

Importa `PluralRulesPipe` y añádelo a tu componente:

```ts
import {Component} from "@angular/core";
import {PluralRulesPipe} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PluralRulesPipe],
  template: `
    <p>{{ 1 | pluralRules }}</p>
  `
})
```

Si `LOCALE_ID` está establecido a `en-US`, el ejemplo anterior mostrará `one`, mientras que si está establecido a `es-ES`, mostrará `uno`.

Además, puedes **enviar el locale como último parámetro**:

```html
<p>{{ 1 | pluralRules: 'en-US' }}</p>
```

El ejemplo anterior mostrará `one` en el locale inglés, independientemente de lo que esté establecido en `LOCALE_ID`.

### Configuración

Para explorar opciones de configuración adicionales, puedes personalizar el `PluralRulesPipe` modificando las opciones por defecto a través del proveedor `providePluralRulesOptions`:

```ts
import {Component} from "@angular/core";
import {PluralRulesPipe, providePluralRulesOptions} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PluralRulesPipe],
  providers: [
    providePluralRulesOptions({
      type: 'ordinal',
    })
  ],
  template: `
    <p>{{ 1 | pluralRules }}</p>
  `
})
```

La configuración por defecto es:

```ts
const defaultOptions: Intl.PluralRulesOptions = {
	localeMatcher: 'best fit', // otros valores: "lookup",
	type: 'cardinal', // otros valores: "ordinal"
};
```

Para más información, consulta la [API PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules).

### Manejo de errores

Si se produce un error, el pipe devolverá el valor que se le envió, y se mostrará un error en la consola con más detalles.

`{{ 1 | pluralRules }}` devolverá `1`.

## RelativeTimeFormatPipe

Muestra la representación localizada de un valor de tiempo relativo.

Por ejemplo, el valor `1` se mostrará como `in 1 day` en inglés, y `dentro de 1 día` en español.

### Uso

Importa `RelativeTimeFormatPipe` y añádelo a tu componente:

```ts
import {Component} from "@angular/core";
import {RelativeTimeFormatPipe} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RelativeTimeFormatPipe],
  template: `
    <p>{{ 1 | relativeTimeFormat: 'day' }}</p>
  `
})
```

Si `LOCALE_ID` está establecido a `en-US`, el ejemplo anterior mostrará `in 1 day`, mientras que si está establecido a `es-ES`, mostrará `dentro de 1 día`.

Además, puedes **enviar el estilo y el locale como parámetros**:

```html
<p>{{ 1 | relativeTimeFormat: 'day' : 'long' : 'es-ES' }}</p>
```

El ejemplo anterior mostrará `dentro de 1 día` en el locale español, independientemente de lo que esté establecido en `LOCALE_ID`.

### Configuración

Para explorar opciones de configuración adicionales, puedes personalizar el `RelativeTimeFormatPipe` modificando las opciones por defecto a través del proveedor `provideRelativeTimeFormatOptions`:

```ts
import {Component} from "@angular/core";
import {RelativeTimeFormatPipe, provideRelativeTimeFormatOptions} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RelativeTimeFormatPipe],
  providers: [
    provideRelativeTimeFormatOptions({
      numeric: 'auto',
      style: 'long',
    })
  ],
  template: `
    <p>{{ 1 | relativeTimeFormat: 'day' }}</p>
  `
})
```

La configuración por defecto es:

```ts
const defaultOptions: Intl.RelativeTimeFormatOptions = {
	localeMatcher: 'best fit', // other values: "lookup",
	numeric: 'always', // other values: "auto"
	style: 'long', // other values: "short" or "narrow"
};
```

Para más información, consulta la [API RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat).

### Manejo de errores

Si se produce un error, el pipe devolverá el valor que se le envió, y se mostrará un error en la consola con más detalles.

`{{ 1 | relativeTimeFormat: 'day' }}` devolverá `1`.

## SupportedValuesOf

Esto es una utilidad que transforma una clave en un array que contiene los valores de calendario, ordenación, moneda, sistemas de numeración o unidades soportados por la implementación.

### Usage

Importa `SupportedValuesOf` y añádelo a tu componente:

```ts

import {Component} from "@angular/core";
import {SupportedValuesOf} from 'ngxtension/intl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SupportedValuesOf],
  template: `
    <p>{{ 'currency' | supportedValuesOf }}</p>
  `
})
```

El ejemplo anterior mostrará `["BRL", "CNY", "EUR", "GBP", "INR", "JPY", "KRW", "MXN", "RUB", "USD"]` si `LOCALE_ID` está establecido a `en-US`.

El valor puede ser cualquiera de los siguientes:

- `calendar` - Valores de calendario soportados, como `buddhist`, `chinese`, `coptic`, y así sucesivamente.
- `collation` - Valores de ordenación soportados, como `big5han`, `compat`, `ebase`, `emoji`, y así sucesivamente.
- `currency` - Valores de moneda soportados, como `BRL`, `CNY`, `EUR`, y así sucesivamente.
- `numberingSystem` - Valores de sistema de numeración soportados, como `arab`, `arabext`, `bali`, y así sucesivamente.
- `timeZone` - Valores de zona horaria soportados, como `America/Los_Angeles`, `Asia/Kolkata`, `Asia/Tokyo`, y así sucesivamente.
- `unit` - Valores de unidad soportados, como `acre`, `bit`, `byte`, `celsius`, y así sucesivamente.

No estoy seguro de cuánto lo necesitarás, pero está ahí de ser así.

Para más información, consulta la [API SupportedValuesOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf).
