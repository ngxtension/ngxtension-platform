---
title: Signal Inputs Migration
description: Schematics for migrating decorator inputs to signal inputs (including input references)
entryPoint: convert-signal-inputs
badge: stable
contributor: chau-tran
---

In Angular v17.1, signal inputs were released. Signal inputs enables developers to have more declarative and reactive code patterns. This is the reason why `ngxtension` publishes schematics that handles the code migration for you.

### How it works?

The moment you run the schematics, it will look for all the decorators that have inputs and convert them to signal inputs.

- It will keep the same name for the inputs.
- It will keep the same types and default values.
- It will also convert the input references to signal input references.
- It will update the components template to use the new signal inputs (by adding `()` to the input references, it may cause some errors when it comes to type narrowing of signal function calls, but that's something that you can fix, by adding `!` to the signal function calls that are inside `@if` blocks).

- It won't convert input setters to signal input setters.

### Usage

In order to run the schematics for all the project in the app you have to run the following script:

```bash
ng g ngxtension:convert-signal-inputs
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension:convert-signal-inputs --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension:convert-signal-inputs --path=<path-to-ts-file>
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension:convert-signal-inputs --project=<project-name>
```
