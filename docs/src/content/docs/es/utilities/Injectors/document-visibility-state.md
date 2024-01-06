---
title: documentVisibilityState
description: ngxtension/document-visibility-state
badge: stable
contributor: fiorelozere
---

`injectDocumentVisibility` es una función que proporciona una signal reactiva que refleja el estado de visibilidad actual del documento. Esta función es particularmente útil para escenarios como el seguimiento de la presencia del usuario en una página web (por ejemplo, para análisis o pausar/reanudar actividades) y se puede adaptar para su uso con iframes o en entornos de prueba.

```ts
import { injectDocumentVisibility } from 'ngxtension/document-visibility-state';
```

## Uso

`injectDocumentVisibility` acepta un parámetro opcional `options` que puede incluir un `document` personalizado y una instancia de `Injector`. El parámetro `document` es particularmente útil para escenarios de prueba o cuando se necesita dar seguimiento a la visibilidad de un iframe. El `injector` permite la inyección de dependencias, dando más flexibilidad y facilitando el código probable al desacoplarlo del estado o contexto global.

```ts
const visibilityState = injectDocumentVisibility();

effect(() => {
	console.log(visibilityState.value);
});
```

## API

```ts
function injectDocumentVisibility(
	options?: InjectDocumentVisibilityOptions,
): Signal<DocumentVisibilityState>;
```

### Parámetros

- `options` (opcional): Un objeto que puede tener las siguientes propiedades:
  - `document`: Una instancia personalizada de `Document`, que por defecto es el objeto global `document`.
  - `injector`: Una instancia de `Injector` para la inyección de dependencias de Angular.

### Retornos

- `Signal<DocumentVisibilityState>`: Una signal reactiva que emite el estado actual de visibilidad del documento (por ejemplo, `"visible"`, `"hidden"`) y se actualiza cuando cambia el estado de visibilidad del documento.'
