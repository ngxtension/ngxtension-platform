---
title: injectLocalStorage
description: ngxtension/inject-local-storage
entryPoint: ngxtension/inject-local-storage
badge: stable
contributors: ['enea-jahollari']
---

This injector provides a reactive local storage management system using Angular's dependency injection and reactivity model. This API allows for easy integration and manipulation of local storage with real-time synchronization across browser tabs and dynamic key support.

## API

### Injection Token: `NGXTENSION_LOCAL_STORAGE`

- **Description**: Token for the local storage service, allowing for custom implementations to be provided.
- **Factory Default**: Uses the browser's `localStorage`.

### Function: `provideLocalStorageImpl`

- **Parameters**:
  - `impl`: A custom implementation of the `localStorage` interface.
- **Returns**: An Angular provider object that uses the given implementation.

### Type: `LocalStorageOptions<T>`

Options to configure the behavior of the local storage signal.

- **Fields**:
  - `defaultValue`: The default value used if the key is not present in local storage. It can be a direct value or a function returning a value.
  - `storageSync`: If set to `true`, synchronizes data across browser tabs. Defaults to `true`.
  - `stringify`: A custom function to serialize stored data. Defaults to `JSON.stringify`.
  - `parse`: A custom function to deserialize stored data. Defaults to a function handling JSON parsing with support for `undefined`.
  - `injector`: Optional custom injector for dependency resolution.
  - `clearOnKeyChange`: If set to true, removes the value stored under the previous key from localStorage when the computed key changes. Applies only when a key-computation function is provided. Defaults to `true`.

### Function: `injectLocalStorage`

- **Parameters**:
  - `keyOrComputation`: A string key or a computation function returning a key string under which data is stored. If a function is provided, the signal will reinitialize whenever the computed key changes.
  - `options`: Configuration options of type `LocalStorageOptions`.
- **Returns**: A reactive signal (`LocalStorageSignal<T>`) with `set` and `update` methods representing the state of the local storage item. Updates to this signal are reflected in local storage (and emit a `storage` event), and external storage events update the signal if `storageSync` is enabled.

## Usage

1. **Injecting Custom Local Storage**:
   Use `provideLocalStorageImpl` to override the default local storage implementation if necessary.

2. **Creating a Local Storage Signal**:
   Use `injectLocalStorage` to create a reactive local storage signal. Configure behavior with `LocalStorageOptions`.

## Example

Here's a basic example of using `injectLocalStorage`:

```typescript
const username = injectLocalStorage<string>('username');

username.set('John Doe');
username.update((name) => 'Guest ' + name);

effect(() => {
	console.log(username());
});
```

Use `username` in your component to get or set the username stored in local storage. The value might be `undefined` if no default value is provided.

**Fallback value**:

```typescript
const username = injectLocalStorage<string>('username', {
	defaultValue: 'Guest',
});
```

Uses 'Guest' if 'username' is not in local storage.

**Storage synchronization**:

```typescript
const username = injectLocalStorage<string>('username', {
	storageSync: true,
});
```

Changes reflect across browser tabs (default = true).

**Dynamic key support**:

```typescript
const currentUserId = signal('user-1');
const settings = injectLocalStorage(() => `settings-${currentUserId()}`, {
	defaultValue: { theme: 'light' },
});
```

Reinitializes when currentUserId() changes.

**Remove LocalStorage Item**:

```typescript
const username = injectLocalStorage<string>('username');
username.set(undefined);
```

Setting `undefined` removes the item from local storage. Note that setting the value to `null` will store the string `'null'` and will **not** remove the item.
