---
title: injectLocalStorage
description: A writable signal backed by localStorage, with default values, custom serialization, dynamic keys and sync across browser tabs.
entryPoint: ngxtension/inject-local-storage
badge: stable
contributors: ['enea-jahollari']
---

`injectLocalStorage` gives you a `WritableSignal` whose value lives in `localStorage`. Read it like any signal, and
`set()` or `update()` it to write through to storage. By default it also stays in sync when another tab, or another
signal for the same key, changes the value.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { injectLocalStorage } from 'ngxtension/inject-local-storage';

@Component({
	selector: 'app-theme-toggle',
	template: `
		<button type="button" (click)="toggle()">Theme: {{ theme() }}</button>
	`,
})
export class ThemeToggle {
	readonly theme = injectLocalStorage<'light' | 'dark'>('theme', {
		defaultValue: 'light',
	});

	toggle() {
		this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
	}
}
```

The choice survives reloads, and every open tab of your app updates when the user toggles it.

## Default value

Without `defaultValue`, the signal is `undefined` until something is stored under the key:

```ts
const username = injectLocalStorage<string>('username'); // WritableSignal<string | undefined>

username.set('John Doe');
username.update((name) => 'Guest ' + name);
```

With `defaultValue`, the signal uses it when the key is missing (or its value can't be parsed), and the type no longer
includes `undefined`:

```ts
const username = injectLocalStorage<string>('username', {
	defaultValue: 'Guest',
}); // WritableSignal<string>
```

The default isn't written to storage until you call `set()` or `update()`. You can also pass a function,
`defaultValue: () => computeDefault()`, which is called only when the default is needed.

## Objects

Values are stored with `JSON.stringify` and read back with `JSON.parse`, so objects and arrays work out of the box.

```ts
interface Settings {
	theme: 'light' | 'dark';
	pageSize: number;
}

const settings = injectLocalStorage<Settings>('settings', {
	defaultValue: { theme: 'light', pageSize: 20 },
});

settings.update((s) => ({ ...s, pageSize: 50 }));
```

Create a new object when you update, as above. Mutating the current object doesn't write anything to storage.

## Remove the item

Set the signal to `undefined` to remove the key from `localStorage`:

```ts
const username = injectLocalStorage<string>('username');
username.set(undefined);
```

Setting `null` stores the string `'null'` and does **not** remove the item.

## Dynamic keys

Pass a function instead of a string to compute the key from signals. When the key changes, the signal reads the value
stored under the new key.

```ts
const currentUserId = signal('user-1');

const settings = injectLocalStorage(() => `settings-${currentUserId()}`, {
	defaultValue: { theme: 'light' },
	clearOnKeyChange: false,
});
```

:::caution[The previous key is removed by default]
With a key function, `clearOnKeyChange` defaults to `true`: when the key changes, the value stored under the previous
key is **removed** from `localStorage`. In the example above, switching from `user-1` to `user-2` would delete
`settings-user-1`. Set `clearOnKeyChange: false` when each key holds data you want to keep, such as per-user settings.
:::

## Sync across tabs

With `storageSync: true` (the default), the signal:

- listens to the browser's `storage` event, so it updates when another tab writes the same key;
- dispatches a `storage` event in the current tab when you write, so other `injectLocalStorage` signals for the same
  key in this tab update too.

Set `storageSync: false` to opt out of both.

```ts
const draft = injectLocalStorage<string>('draft', { storageSync: false });
```

## Custom serialization

Use `stringify` and `parse` for values that JSON can't round-trip, such as dates:

```ts
const lastVisit = injectLocalStorage<Date>('last-visit', {
	defaultValue: () => new Date(),
	stringify: (date) => date.toISOString(),
	parse: (value) => new Date(value),
});
```

## Use another storage

`provideLocalStorageImpl` replaces the storage behind every `injectLocalStorage` call in that injector tree. Any object
that implements the `Storage` interface works, for example `sessionStorage`:

```ts
import { provideLocalStorageImpl } from 'ngxtension/inject-local-storage';

bootstrapApplication(App, {
	providers: [provideLocalStorageImpl(sessionStorage)],
});
```

:::note[SSR]
The default implementation reads the global `localStorage`. If your server runtime doesn't have one, provide another
`Storage` implementation (for example an in-memory one) in your server providers with `provideLocalStorageImpl`.
:::

## API

```ts
function injectLocalStorage<T>(
	key: string | (() => string),
	options?: LocalStorageOptions<T>,
): WritableSignal<T | undefined>; // WritableSignal<T> when `defaultValue` is set

function provideLocalStorageImpl(impl: Storage): Provider;

const NGXTENSION_LOCAL_STORAGE: InjectionToken<Storage>;
```

### Options

| Option             | Type                   | Default                                   | Description                                                                                      |
| ------------------ | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `defaultValue`     | `T \| (() => T)`       | -                                         | Value used when the key is missing or can't be parsed. Removes `undefined` from the signal type. |
| `storageSync`      | `boolean`              | `true`                                    | Sync with other tabs and with other signals for the same key in this tab.                        |
| `stringify`        | `(value: T) => string` | `JSON.stringify`                          | Serializes the value before it is stored.                                                        |
| `parse`            | `(value: string) => T` | `JSON.parse` (also handles `'undefined'`) | Deserializes the stored string.                                                                  |
| `clearOnKeyChange` | `boolean`              | `true`                                    | Only with a key function: remove the previous key's value when the key changes.                  |
| `injector`         | `Injector`             | -                                         | Injector to use when you call it outside an injection context.                                   |

Errors from storage reads and writes (such as a full quota) are caught, so the signal keeps working in memory.

## Related

- [Angular signals](https://angular.dev/guide/signals): the returned value is a regular `WritableSignal`, so you can use
  it in `computed`, `effect` and templates.
