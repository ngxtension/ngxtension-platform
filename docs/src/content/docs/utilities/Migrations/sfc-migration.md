---
title: Convert to SFC components migration
description: Schematics for converting Angular components to SFC components
entryPoint: convert-to-sfc
badge: stable
contributors: ['enea-jahollari']
---

Angular components can have inline templates or have a separate template file. The inline templates are called SFC (Single File Components) and are a common practice in modern Angular applications.
This schematic helps you convert your Angular components to SFC components.

### How it works?

The moment you run the schematics, it will look for all the components in your project and will convert them to SFC components.

- It will move the template from the `templateUrl` to the `template` property.
- It will move the styles from the `styleUrls` to the `styles` property.
- The maximum lines length for the template is set to 200 lines. If the template has more than 200 lines, it will be skipped.

In order to change the maximum line length, you can pass the `--max-inline-template-lines` param to the schematics. For styles, you can pass the `--max-inline-style-lines` param.

``bash

### Usage

In order to run the schematics for all the project in the app you have to run the following script:

```bash
ng g ngxtension:convert-to-sfc
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension:convert-to-sfc --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension:convert-to-sfc --path=<path-to-ts-file>
```

If you want to change the maximum line length for the template or styles you can pass the `--max-inline-template-lines` param or `--max-inline-style-lines` param.

```bash
ng g ngxtension:convert-to-sfc --max-inline-template-lines=100 --max-inline-style-lines=100
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension:convert-to-sfc --project=<project-name>
```
