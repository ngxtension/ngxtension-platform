---
title: Intl
description: Standalone Angular pipes for the browser's Intl API, to show localized language and region names, lists, plural categories and relative times.
entryPoint: ngxtension/intl
badge: stable
contributors: ['ion-prodan']
---

`ngxtension/intl` is a set of standalone pipes built on the browser's [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl). They cover formatting that Angular's `date`, `number` and `currency` pipes don't: language and country names, lists, plural categories and relative times like "3 hours ago". Nothing to load: the locale data comes from the browser.

| Pipe                                                | Template name        | Example output                    |
| --------------------------------------------------- | -------------------- | --------------------------------- |
| [`DisplayNamesPipe`](#displaynamespipe)             | `displayNames`       | `'DE'` → `Germany`                |
| [`ListFormatPipe`](#listformatpipe)                 | `listFormat`         | `['a', 'b', 'c']` → `a, b, and c` |
| [`PluralRulesPipe`](#pluralrulespipe)               | `pluralRules`        | `1` → `one`                       |
| [`RelativeTimeFormatPipe`](#relativetimeformatpipe) | `relativeTimeFormat` | `-3, 'hour'` → `3 hours ago`      |
| [`SupportedValuesOf`](#supportedvaluesof)           | `supportedValuesOf`  | `'currency'` → `['AED', …]`       |

## Usage

Import the pipes you need into your component:

```angular-ts
import { Component, signal } from '@angular/core';
import { DisplayNamesPipe, ListFormatPipe, RelativeTimeFormatPipe } from 'ngxtension/intl';

@Component({
	selector: 'app-team-card',
	imports: [DisplayNamesPipe, ListFormatPipe, RelativeTimeFormatPipe],
	template: `
		<p>Based in {{ country() | displayNames: 'region' : 'long' }}</p>
		<p>Members: {{ members() | listFormat }}</p>
		<p>Last active {{ -3 | relativeTimeFormat: 'hour' }}</p>
	`,
})
export class TeamCardComponent {
	readonly country = signal('DE');
	readonly members = signal(['Ada', 'Grace', 'Linus']);
}
```

With `LOCALE_ID` set to `en-US`, this renders:

```txt
Based in Germany
Members: Ada, Grace, and Linus
Last active 3 hours ago
```

### Locale

Every pipe except `supportedValuesOf` formats in the app's [`LOCALE_ID`](https://angular.dev/api/core/LOCALE_ID). To use another locale for a single value, pass it as the **last argument**:

```html
{{ members() | listFormat: 'long' : 'fr' }}
<!-- Ada, Grace et Linus -->
```

### Default options

Each pipe except `supportedValuesOf` has a `provide…Options()` function to change its defaults. Add it to `providers` in a component, a route or `app.config.ts`. The options you pass are merged with the pipe's defaults.

### Errors

The pipes never throw. When `Intl` rejects an input (an invalid code, an unsupported locale), the pipe logs the error with `console.error` and returns a fallback, listed in each section below.

:::note
Output comes from the browser's own locale data, so wording can differ slightly between browsers and versions.
:::

## DisplayNamesPipe

Shows the localized name of a language, region, script, currency or calendar code. Wraps [`Intl.DisplayNames`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames).

```html
{{ 'DE' | displayNames: 'region' }}
<!-- Germany -->
{{ 'US' | displayNames: 'region' }}
<!-- US -->
{{ 'US' | displayNames: 'region' : 'long' }}
<!-- United States -->
{{ 'en-US' | displayNames: 'language' : 'long' }}
<!-- American English -->
{{ 'EUR' | displayNames: 'currency' }}
<!-- Euro -->
{{ 'en' | displayNames: 'language' : 'long' : 'de' }}
<!-- Englisch -->
```

**Arguments:** `code | displayNames: type : style? : locale?`

| Argument | Type                                                                                | Description                           |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| `type`   | `'language' \| 'region' \| 'script' \| 'currency' \| 'calendar' \| 'dateTimeField'` | Required. What kind of code you pass. |
| `style`  | `'long' \| 'short' \| 'narrow'`                                                     | Overrides the default style.          |
| `locale` | `string \| string[]`                                                                | Overrides `LOCALE_ID`.                |

**Defaults:** `{ style: 'short', localeMatcher: 'lookup', fallback: 'code' }`. Change them with `provideDisplayNamesOptions()`. The `type` can't be set there: always pass it in the template.

```ts
providers: [provideDisplayNamesOptions({ style: 'long' })];
```

**Fallback:** the code you passed in.

## ListFormatPipe

Joins a list with the locale's separators and conjunction. Wraps [`Intl.ListFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat).

```html
{{ ['Ada', 'Grace', 'Linus'] | listFormat }}
<!-- Ada, Grace, and Linus -->
{{ ['Ada', 'Grace', 'Linus'] | listFormat: 'short' }}
<!-- Ada, Grace, & Linus -->
{{ ['Ada', 'Grace', 'Linus'] | listFormat: 'long' : 'de' }}
<!-- Ada, Grace und Linus -->
```

**Arguments:** `values | listFormat: style? : locale?`, where `values` is any `Iterable<string>` (an array or a `Set`).

| Argument | Type                            | Description                  |
| -------- | ------------------------------- | ---------------------------- |
| `style`  | `'long' \| 'short' \| 'narrow'` | Overrides the default style. |
| `locale` | `string \| string[]`            | Overrides `LOCALE_ID`.       |

**Defaults:** `{ style: 'long', type: 'conjunction' }`. Set `type` with the provider to get "or" lists or unit lists:

```ts
providers: [provideListFormatOptions({ type: 'disjunction' })];
// ['Ada', 'Grace', 'Linus'] → Ada, Grace, or Linus
```

**Fallback:** the values joined with `, `.

## PluralRulesPipe

Returns the plural **category** of a number in the current locale: `zero`, `one`, `two`, `few`, `many` or `other`. It doesn't translate anything; use the category to pick the right text. Wraps [`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules).

```html
{{ 1 | pluralRules }}
<!-- one -->
{{ 5 | pluralRules }}
<!-- other -->

@switch (count() | pluralRules) { @case ('one') { {{ count() }} file selected }
@default { {{ count() }} files selected } }
```

With `type: 'ordinal'`, you get the category for "1st, 2nd, 3rd". Map it to a suffix:

```angular-ts
import { Component, input } from '@angular/core';
import { PluralRulesPipe, providePluralRulesOptions } from 'ngxtension/intl';

@Component({
	selector: 'app-rank',
	imports: [PluralRulesPipe],
	providers: [providePluralRulesOptions({ type: 'ordinal' })],
	template: `{{ place() }}{{ suffixes[place() | pluralRules] }} place`,
})
export class RankComponent {
	readonly place = input.required<number>();

	// 1st, 2nd, 3rd, 4th, … 22nd
	protected readonly suffixes: Record<string, string> = {
		one: 'st',
		two: 'nd',
		few: 'rd',
		other: 'th',
	};
}
```

**Arguments:** `value | pluralRules: locale?`

| Argument | Type     | Description            |
| -------- | -------- | ---------------------- |
| `locale` | `string` | Overrides `LOCALE_ID`. |

**Defaults:** `{ localeMatcher: 'best fit', type: 'cardinal' }`. Change them with `providePluralRulesOptions()`.

**Fallback:** the number as a string.

## RelativeTimeFormatPipe

Formats a number of units as a relative time, like "in 2 days" or "3 hours ago". Negative values are in the past. Wraps [`Intl.RelativeTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat).

```html
{{ 1 | relativeTimeFormat: 'day' }}
<!-- in 1 day -->
{{ -3 | relativeTimeFormat: 'hour' }}
<!-- 3 hours ago -->
{{ 2 | relativeTimeFormat: 'day' : 'narrow' }}
<!-- in 2d -->
{{ 1 | relativeTimeFormat: 'day' : 'long' : 'es' }}
<!-- dentro de 1 día -->
```

**Arguments:** `value | relativeTimeFormat: unit : style? : locale?`

| Argument | Type                                                                                                       | Description                  |
| -------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `unit`   | `'second' \| 'minute' \| 'hour' \| 'day' \| 'week' \| 'month' \| 'quarter' \| 'year'` (singular or plural) | Required. Unit of `value`.   |
| `style`  | `'long' \| 'short' \| 'narrow'`                                                                            | Overrides the default style. |
| `locale` | `string`                                                                                                   | Overrides `LOCALE_ID`.       |

**Defaults:** `{ localeMatcher: 'best fit', numeric: 'always', style: 'long' }`. Set `numeric: 'auto'` to get words instead of numbers where the locale has them:

```ts
providers: [provideRelativeTimeFormatOptions({ numeric: 'auto' })];
// 1 day → tomorrow, -1 day → yesterday
```

**Fallback:** the number as a string.

:::tip
The pipe doesn't compute the difference between two dates for you. Calculate the value and pick the unit in your component, for example with a `computed()`.
:::

## SupportedValuesOf

Returns the values the browser supports for a category. Wraps [`Intl.supportedValuesOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf). The class is named `SupportedValuesOf`, without the `Pipe` suffix. The result depends on the browser, not on the locale.

Combine it with `displayNames` to build a currency picker:

```angular-ts
import { Component } from '@angular/core';
import { DisplayNamesPipe, SupportedValuesOf } from 'ngxtension/intl';

@Component({
	selector: 'app-currency-select',
	imports: [SupportedValuesOf, DisplayNamesPipe],
	template: `
		<select>
			@for (code of 'currency' | supportedValuesOf; track code) {
				<option [value]="code">{{ code | displayNames: 'currency' }}</option>
			}
		</select>
	`,
})
export class CurrencySelectComponent {}
```

**Argument:** the category key, one of `'calendar'`, `'collation'`, `'currency'`, `'numberingSystem'`, `'timeZone'` or `'unit'`.

**Fallback:** an empty array.

## API

```ts
// Pipes (all standalone)
class DisplayNamesPipe {
	transform(
		code: string,
		type: Intl.DisplayNamesType,
		style?: Intl.DisplayNamesOptions['style'],
		locale?: string | string[],
	): string | undefined;
}

class ListFormatPipe {
	transform(
		value: Iterable<string>,
		style?: Intl.ListFormatOptions['style'],
		locale?: string | string[],
	): string;
}

class PluralRulesPipe {
	transform(value: number, locale?: string): Intl.LDMLPluralRule | string;
}

class RelativeTimeFormatPipe {
	transform(
		value: number,
		unit: Intl.RelativeTimeFormatUnit,
		style?: Intl.RelativeTimeFormatOptions['style'],
		locale?: string,
	): string;
}

class SupportedValuesOf {
	transform(
		key:
			| 'calendar'
			| 'collation'
			| 'currency'
			| 'numberingSystem'
			| 'timeZone'
			| 'unit',
	): string[];
}

// Default options providers
function provideDisplayNamesOptions(
	options: Partial<Omit<Intl.DisplayNamesOptions, 'type'>>,
): Provider;
function provideListFormatOptions(
	options: Partial<Intl.ListFormatOptions>,
): Provider;
function providePluralRulesOptions(
	options: Partial<Intl.PluralRulesOptions>,
): Provider;
function provideRelativeTimeFormatOptions(
	options: Partial<Intl.RelativeTimeFormatOptions>,
): Provider;
```

## Related

- Angular's built-in [`DatePipe`, `DecimalPipe`, `CurrencyPipe` and `PercentPipe`](https://angular.dev/guide/templates/pipes#built-in-pipes) for dates and numbers.
- Angular's [`I18nPluralPipe`](https://angular.dev/api/common/I18nPluralPipe) and ICU expressions for pluralized messages.
