---
title: injectLocalStorage
description: ngxtension/inject-local-storage
entryPoint: ngxtension/inject-local-storage
badge: stable
contributors: ['enea-jahollari']
---

This injector provides a reactive local storage management system using Angular's dependency injection and reactivity model. This API allows for easy integration and manipulation of local storage with real-time synchronization across browser tabs.

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

### Function: `injectLocalStorage`

- **Parameters**:
  - `key`: The local storage key under which data is stored.
  - `options`: Configuration options of type `LocalStorageOptions`.
- **Returns**: A `WritableSignal` representing the state of the local storage item. Updates to this signal are reflected in local storage and vice versa if `storageSync` is true.

## Usage

1. **Injecting Custom Local Storage**:
   Use `provideLocalStorageImpl` to override the default local storage implementation if necessary.

2. **Creating a Local Storage Signal**:
   Use `injectLocalStorage` to create a reactive local storage signal. Configure behavior with `LocalStorageOptions`.

3. **Responding to Changes**:
   Local storage changes reflect automatically in the signal if `storageSync` is enabled, and vice versa. Use the signal in your Angular components to reactively update the UI based on local storage data.

## Example

Here's a basic example of using `injectLocalStorage`:

```typescript
const username = injectLocalStorage<string>('username');

username.set('John Doe');
username.update((username) => 'Guest ' + username);

effect(() => {
	console.log(username());
});
// Use `username` in your component to get or set the username stored in local storage.
// The value might be null or undefined if default value is not provided.
```

Fallback value can be provided using the `defaultValue` option:

```typescript
const username = injectLocalStorage<string>('username', {
	defaultValue: 'Guest',
});
// If the key 'username' is not present in local storage, the default value 'Guest' will be used.
```

Storage synchronization can be enabled using the `storageSync` option:

```typescript
const username = injectLocalStorage<string>('username', {
	storageSync: true,
});
// Changes to the local storage will be reflected across browser tabs.
```
