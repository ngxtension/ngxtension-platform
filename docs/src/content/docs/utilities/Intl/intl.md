---
title: Intl
description: Additional Intl Utilities for formatting numbers, strings, and other objects.
badge: stable
contributor: Ion Prodan
---

This is a collection of pipes designed for Angular applications that leverage the [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

While it's not intended to fully replace Angular's standard pipes for `currency`, `date`, and `number`, it serves as a supplemental toolkit to enhance existing functionalities.

The default locale is determined by the [`LOCALE_ID` token](https://angular.io/api/core/LOCALE_ID). Altering this will change the locale for all included pipes.

Alternatively, you can specify the locale directly as the **final parameter to any pipe, thereby overriding the default setting**.

These pipes aim to utilize the Intl API. In cases where the Intl API is unavailable, the pipes will automatically resort to alternative methods, varying by the specific pipe in use.

For instance, [`DisplayNamesPipe`](#displaynamespipe) processes the code value passed into it, whereas [`ListFormatPipe`](#listformatpipe) outputs the array values as a string.

Should an issue arise, an error message will be displayed in the console to provide further insights.

## DisplayNamesPipe

Displays the localized display name of the given key for the given type.

For example, the display name of the language code "en" in English is "English", and in German it's "Englisch".

### Usage

Import `DisplayNamesPipe` and add it to your component:

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

Additionally, you can **send the style and locale as parameters**:

```html
<p>{{ 'en' | displayNames: 'language' : 'long' : 'de' }}</p>
```

The above example will display `Englisch` in German locale, no matter what `LOCALE_ID` is set to.

### Configuration

To explore additional configuration settings, you can customize the `DisplayNamesPipe` by modifying the default options through the `provideDisplayNamesOptions` provider:

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

The default options are:

```ts
const defaultOptions: DisplayNamesOptions = {
	style: 'short',
	localeMatcher: 'lookup',
	fallback: 'code',
};
```

For more information, check the [DisplayNames API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames).

### Error Handling

If an error occurs, the pipe will return the value that was sent to it, and a console error will be displayed with more details.

`{{ 'any-nonvalid-value' | displayNames: 'language' }}` will return `any-nonvalid-value`.

## ListFormatPipe

Displays the localized string representation of a list of elements.

For example, the list `['en', 'fr', 'de']` will be displayed as `en, fr, and de` in English, and `en, fr et de` in French.

### Usage

Import `ListFormatPipe` and add it to your component:

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

If `LOCALE_ID` is set to `en-US`, the above example will display `en, fr, and de`, while if it's set to `fr-FR`, it will display `en, fr et de`.

Additionally, you can **send the style and locale as parameters**:

```html
<p>{{ ['en', 'fr', 'de'] | listFormat : 'long' : 'fr' }}</p>
```

The above example will display `en, fr et de` in French locale, no matter what `LOCALE_ID` is set to.

### Configuration

To explore additional configuration settings, you can customize the `ListFormatPipe` by modifying the default options through the `provideListFormatOptions` provider:

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

The default options are:

```ts
const defaultOptions: ListFormatOptions = {
	style: 'long',
	type: 'conjunction',
};
```

For more information, check the [ListFormat API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat).

### Error Handling

If an error occurs, the pipe will return the value of the array as string, and a console error will be displayed with more details.

`{{ ['en', 'fr', 'de'] | listFormat }}` will return `en, fr, de`.

## PluralRulesPipe

Displays the localized string representation of a plural value.

For example, the value `1` will be displayed as `one` in English, and `uno` in Spanish.

### Usage

Import `PluralRulesPipe` and add it to your component:

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

If `LOCALE_ID` is set to `en-US`, the above example will display `one`, while if it's set to `es-ES`, it will display `uno`.

Additionally, you can **send locale as last parameter**:

```html
<p>{{ 1 | pluralRules: 'en-US' }}</p>
```

The above example will display `one` in English locale, no matter what `LOCALE_ID` is set to.

### Configuration

To explore additional configuration settings, you can customize the `PluralRulesPipe` by modifying the default options through the `providePluralRulesOptions` provider:

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

The default options are:

```ts
const defaultOptions: Intl.PluralRulesOptions = {
	localeMatcher: 'best fit', // other values: "lookup",
	type: 'cardinal', // other values: "ordinal"
};
```

For more information, check the [PluralRules API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules).

### Error Handling

If an error occurs, the pipe will return the value that was sent to it, and a console error will be displayed with more details.

`{{ 1 | pluralRules }}` will return `1`.

## RelativeTimeFormatPipe

Displays the localized string representation of a relative time value.

For example, the value `1` will be displayed as `in 1 day` in English, and `dentro de 1 día` in Spanish.

### Usage

Import `RelativeTimeFormatPipe` and add it to your component:

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

If `LOCALE_ID` is set to `en-US`, the above example will display `in 1 day`, while if it's set to `es-ES`, it will display `dentro de 1 día`.

Additionally, you can **send style and locale as parameters**:

```html
<p>{{ 1 | relativeTimeFormat: 'day' : 'long' : 'es-ES' }}</p>
```

The above example will display `dentro de 1 día` in Spanish locale, no matter what `LOCALE_ID` is set to.

### Configuration

To explore additional configuration settings, you can customize the `RelativeTimeFormatPipe` by modifying the default options through the `provideRelativeTimeFormatOptions` provider:

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

The default options are:

```ts
const defaultOptions: Intl.RelativeTimeFormatOptions = {
	localeMatcher: 'best fit', // other values: "lookup",
	numeric: 'always', // other values: "auto"
	style: 'long', // other values: "short" or "narrow"
};
```

For more information, check the [RelativeTimeFormat API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat).

### Error Handling

If an error occurs, the pipe will return the value that was sent to it, and a console error will be displayed with more details.

`{{ 1 | relativeTimeFormat: 'day' }}` will return `1`.

## SupportedValuesOf

This is a utility transforms a key into an array containing the supported calendar, collation, currency, numbering systems, or unit values supported by the implementation.

### Usage

Import `SupportedValuesOf` and add it to your component:

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

The above example will display `["BRL", "CNY", "EUR", "GBP", "INR", "JPY", "KRW", "MXN", "RUB", "USD"]` if `LOCALE_ID` is set to `en-US`.

The key can be any of the following:

- `calendar` - Supported calendar values, such as `buddhist`, `chinese`, `coptic`, and so on.
- `collation` - Supported collation values, such as `big5han`, `compat`, `ebase`, `emoji`, and so on.
- `currency` - Supported currency values, such as `BRL`, `CNY`, `EUR`, and so on.
- `numberingSystem` - Supported numbering system values, such as `arab`, `arabext`, `bali`, and so on.
- `timeZone` - Supported time zone values, such as `America/Los_Angeles`, `Asia/Kolkata`, `Asia/Tokyo`, and so on.
- `unit` - Supported unit values, such as `acre`, `bit`, `byte`, `celsius`, and so on.

Not sure how often you'll need this, but it's there if you do.

For more information, check the [SupportedValuesOf API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf).
