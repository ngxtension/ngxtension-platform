---
title: Introducción
description: ¿Qué es ngxtension?
sidebar:
  order: 1
---

`ngxtension` es una librería de utilidades para [Angular](https://angular.io). Consiste en una variedad de utilidades que facilitan el desarrollo de Angular y lo hacen más consistente.

El proyecto fue iniciado por [Chau](https://github.com/nartc) junto con [Enea](https://twitter.com/Enea_Jahollari) y es completamente [de código abierto](https://github.com/nartc/ngxtension-platform). Agradecemos las contribuciones de todo tipo. Si tienes un problema o una idea, por favor [háznoslo saber](https://github.com/nartc/ngxtension-platform/issues/new).
¿Te encuentras agregando algo una y otra vez a cada proyecto de Angular? Eso es algo que queremos tener en `ngxtension`. Nuestra intención es que `ngxtension` sea "_todo vale_", pero también con consideración cuidadosa y código Angular de calidad para que `ngxtension` pueda convertirse en una tienda única para todos los desarrolladores de Angular.

## Consideración del tamaño del paquete(bundle)

La biblioteca está compuesta enteramente por [Secondary Entry Point](https://angular.io/guide/angular-package-format#entrypoints-and-code-splitting). Aunque enviamos `ngxtension` como un solo paquete (para que sea fácil de instalar para los consumidores), el pipeline de construcción de Angular debe manejar adecuadamente la división de código y el tree-shaking para todos los puntos de entrada que `ngxtension` incluye.

El distintivo de tamaño GZIP (si está disponible) es proporcionado por [bundlejs](https://bundlejs.dev/) y se muestra como el tamaño empaquetado del punto de entrada y todas sus dependencias `ngxtension`. Por ejemplo, `ngxtension/connect` depende de `ngxtension/assert-injector` por lo que el distintivo de tamaño GZIP de `ngxtension/connect` será el tamaño empaquetado de `ngxtension/connect` y `ngxtension/assert-injector`.
