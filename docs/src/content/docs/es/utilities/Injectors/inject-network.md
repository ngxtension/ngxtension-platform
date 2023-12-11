---
title: injectNetwork
description: ngxtension/inject-network
badge: stable
contributor: fiorelozere
---

Este inyector es útil para rastrear el estado actual de la red del usuario. Proporciona información sobre el tipo de conexión del sistema, como 'wifi' o 'celular'. Esta utilidad, junto con una propiedad singular agregada a la interfaz Navigator (Navigator.connection), permite identificar el tipo general de conexión de red que está utilizando un sistema. Esta funcionalidad es particularmente útil para elegir entre contenido de alta definición o baja definición según la conexión de red del usuario.

```ts
import { injectNetwork } from 'ngxtension/inject-network';
```

## Uso

`injectNetwork` acepta un parámetro opcional `options` que puede incluir una instancia personalizada de `window` y un `Injector` que son opcionales. El parámetro `window` es particularmente útil para escenarios de prueba o cuando se necesita rastrear el estado de la red de un iframe. El `injector` permite la inyección de dependencias, proporcionando más flexibilidad y facilitando el código probable al desacoplarlo del estado o contexto global.

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

- `options` (opcional): Un objeto que puede tener las siguientes propiedades:
  - `window`: Una instancia personalizada de `Window`, que por defecto es el objeto global `window`.
  - `injector`: Una instancia de `Injector` para la inyección de dependencias de Angular.

### Retornos

Un objeto readonly con las siguientes propiedades:

- `supported`: Una signal que emite `true` si el navegador soporta la API de información de red, de lo contrario `false`.
- `online`: Una signal que emite `true` si el usuario está en línea, de lo contrario `false`.
- `offlineAt`: Una signal que emite el tiempo desde la última vez que el usuario estuvo conectado.
- `onlineAt`: Una signal que emite el tiempo desde la última vez que el usuario estuvo desconectado.
- `downlink`: Una signal que emite la velocidad de descarga en Mbps.
- `downlinkMax`: Una signal que emite la velocidad máxima de descarga alcanzable en Mbps.
- `effectiveType`: Una signal que emite el tipo de velocidad efectiva detectada.
- `rtt`: Una signal que emite el tiempo estimado de ida y vuelta efectivo de la conexión actual.
- `saveData`: Una signal que emite `true` si el usuario activó el modo de ahorro de datos, de lo contrario `false`.
- `type`: Una signal que emite el tipo de conexión/red detectada.
