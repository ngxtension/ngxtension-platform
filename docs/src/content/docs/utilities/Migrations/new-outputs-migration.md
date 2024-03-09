---
title: New output() Migration
description: Schematics for migrating decorator outputs to function based outputs
entryPoint: convert-outputs
badge: stable
contributors: ['enea-jahollari']
---

In Angular v17.3, new output() were released. The new output() function aligns better with the new input() and pave the road for signal components. This is the reason why `ngxtension` publishes schematics that handles the code migration for you.

### How it works?

The moment you run the schematics, it will look for all the decorators that have outputs and convert them to function based outputs.

- It will keep the same name for the outputs.
- It will keep the same types.
- It will keep the same alias if it's present.
- It will also convert Outputs that are used with observables and not with EventEmitter.

### Usage

In order to run the schematics for all the project in the app you have to run the following script:

```bash
ng g ngxtension:convert-outputs
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension:convert-outputs --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension:convert-outputs --path=<path-to-ts-file>
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension:convert-outputs --project=<project-name>
```
