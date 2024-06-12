---
title: Self Closing Tags Migration
description: Schematics for migrating non-self-closing tags to self-closing tags.
entryPoint: convert-to-self-closing-tag
badge: stable
contributors: ['enea-jahollari']
---

Angular supports self-closing tags. This means that you can write tags like `<app-component />` instead of `<app-component></app-component>`.
This is a feature that was introduced in Angular 16.

### How it works?

The moment you run the schematics, it will look for all the tags that are not self-closing and convert them to self-closing tags.

- It will look for all the tags that don't have any content inside them.
- It will only convert components that have "-" in their name.

### Usage

In order to run the schematics for all the project in the app you have to run the following script:

```bash
ng g ngxtension:convert-to-self-closing-tag
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension:convert-to-self-closing-tag --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension:convert-to-self-closing-tag --path=<path-to-ts-file>
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension:convert-to-self-closing-tag --project=<project-name>
```
