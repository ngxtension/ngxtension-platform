---
title: injectNetwork
description: Signals for the user's online status and connection details (type, effective speed, round-trip time, data saver) from the Network Information API.
entryPoint: ngxtension/inject-network
badge: stable
contributors: ['fiorelozere']
---

`injectNetwork` gives you signals for the user's network: whether they are online, and, where the browser supports the
[Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API), the connection
type, effective speed, round-trip time and data saver setting. Use it to show an offline banner, or to serve lighter
images and videos on slow connections.

Ported from VueUse's [`useNetwork`](https://vueuse.org/core/useNetwork/).

## Usage

```angular-ts
import { Component, computed } from '@angular/core';
import { injectNetwork } from 'ngxtension/inject-network';

@Component({
	selector: 'app-hero',
	template: `
		@if (!network.online()) {
			<p class="banner">You're offline. Changes will sync when you reconnect.</p>
		}

		<img [src]="imageUrl()" alt="Hero" />
	`,
})
export class Hero {
	readonly network = injectNetwork();

	readonly imageUrl = computed(() => {
		const slow =
			this.network.saveData() ||
			['slow-2g', '2g', '3g'].includes(this.network.effectiveType() ?? '');
		return slow ? '/hero-small.jpg' : '/hero-large.jpg';
	});
}
```

`online` works in every browser. The connection details (`type`, `effectiveType`, `downlink`, `rtt`, `saveData`, …)
come from `navigator.connection`, which some browsers (for example Safari and Firefox) don't support. Check
`supported()` and keep a sensible fallback, as the example does.

## Observe another window

Pass `window` to read the network state from another window, such as an iframe's `contentWindow`, or a fake window in
tests.

```ts
const network = injectNetwork({ window: iframe.contentWindow! });
```

## SSR

On the server, `online()` is `true` and no listeners are added. The connection signals keep their initial values
(see below) until the app runs in the browser.

## API

```ts
function injectNetwork(options?: InjectNetworkOptions): Readonly<NetworkState>;
```

| Option     | Type       | Default                         | Description                                                    |
| ---------- | ---------- | ------------------------------- | -------------------------------------------------------------- |
| `window`   | `Window`   | `defaultView` of the `DOCUMENT` | The window whose `navigator` and events are used.              |
| `injector` | `Injector` | -                               | Injector to use when you call it outside an injection context. |

### Returns

A read-only object of signals. Listeners are removed when the calling component or service is destroyed.

| Signal          | Type                                        | Description                                                                                                          |
| --------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `supported`     | `Signal<boolean>`                           | Whether the browser supports the Network Information API (`navigator.connection`).                                   |
| `online`        | `Signal<boolean>`                           | Whether the browser is online (`navigator.onLine`, updated on `online`/`offline` events).                            |
| `offlineAt`     | `Signal<number \| undefined>`               | Timestamp (`Date.now()`) of when the user last went offline.                                                         |
| `onlineAt`      | `Signal<number \| undefined>`               | Timestamp (`Date.now()`) of when the user last came back online.                                                     |
| `downlink`      | `Signal<number \| undefined>`               | Estimated download bandwidth in Mbps.                                                                                |
| `downlinkMax`   | `Signal<number \| undefined>`               | Maximum download speed in Mbps for the underlying connection technology.                                             |
| `effectiveType` | `Signal<NetworkEffectiveType \| undefined>` | Effective connection type: `'slow-2g'`, `'2g'`, `'3g'`, `'4g'` or `'5g'`.                                            |
| `rtt`           | `Signal<number \| undefined>`               | Estimated round-trip time in milliseconds.                                                                           |
| `saveData`      | `Signal<boolean \| undefined>`              | Whether the user enabled a data saver mode.                                                                          |
| `type`          | `Signal<NetworkType>`                       | Connection type: `'bluetooth'`, `'cellular'`, `'ethernet'`, `'none'`, `'wifi'`, `'wimax'`, `'other'` or `'unknown'`. |

The connection signals (`downlink`, `effectiveType`, `rtt`, `saveData`, `type`, …) only update when the API is
supported; otherwise they keep their initial values (`undefined`, `false` for `saveData` and `'unknown'` for `type`).
