---
title: injectNetwork
description: ngxtension/inject-network
entryPoint: inject-network
badge: stable
contributor: fiorelozere
---

This injector is useful for tracking the current network state of the user. It provides information about the system's connection type, such as 'wifi' or 'cellular'. This utility, along with a singular property added to the Navigator interface (Navigator.connection), allows for the identification of the general type of network connection a system is using. This functionality is particularly useful for choosing between high definition or low definition content depending on the user's network connection.

```ts
import { injectNetwork } from 'ngxtension/inject-network';
```

## Usage

`injectNetwork` accepts an optional parameter `options` which can include a custom `window` and an `Injector` instance that are both optional. The `window` parameter is particularly useful for testing scenarios or when needing to track the network state of an iframe. The `injector` allows for dependency injection, providing more flexibility and facilitating testable code by decoupling from the global state or context.

```ts
const networkState = injectNetwork();

effect(() => {
	console.log(this.network.type());
	console.log(this.network.downlink());
	console.log(this.network.downlinkMax());
	console.log(this.network.effectiveType());
	console.log(this.network.rtt());
	console.log(this.network.saveData());
	console.log(this.network.online());
	console.log(this.network.offlineAt());
	console.log(this.network.onlineAt());
	console.log(this.network.supported());
});
```

## API

```ts
function injectNetwork(options?: InjectNetworkOptions): Readonly<NetworkState>;
```

### Parameters

- `options` (optional): An object that can have the following properties:
  - `window`: A custom `Window` instance, defaulting to the global `window` object.
  - `injector`: An `Injector` instance for Angular's dependency injection.

### Returns

A readonly object with the following properties:

- `supported`: A signal that emits `true` if the browser supports the Network Information API, otherwise `false`.
- `online`: A signal that emits `true` if the user is online, otherwise `false`.
- `offlineAt`: A signal that emits the time since the user was last connected.
- `onlineAt`: A signal that emits the time since the user was last disconnected.
- `downlink`: A signal that emits the download speed in Mbps.
- `downlinkMax`: A signal that emits the max reachable download speed in Mbps.
- `effectiveType`: A signal that emits the detected effective speed type.
- `rtt`: A signal that emits the estimated effective round-trip time of the current connection.
- `saveData`: A signal that emits `true` if the user activated data saver mode, otherwise `false`.
- `type`: A signal that emits the detected connection/network type.
