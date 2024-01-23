---
title: CallPipe / ApplyPipe
description: Standalone Angular pipes for invoking pure functions with arguments, leveraging Angular's pure pipe memoization.
entryPoint: call-apply
badge: stable
contributors: ['daniele-morosinotto']
---

## Import

```typescript
import { CallPipe, ApplyPipe } from 'ngxtension/call-apply';
```

## Usage

Both `CallPipe` and `ApplyPipe` require a PURE function. They are designed to take advantage of Angular's pure pipe memoization. Using `this` inside the function body will throw an error.

### CallPipe

For functions with a single argument.

```typescript
@Component({
	selector: 'my-app',
	imports: [CallPipe],
	template: `
		<b>call UTC: {{ now | call: ISOFormat }}</b>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	public now = new Date();
	public ISOFormat = (date: Date) => date.toISOString();
}
```

### ApplyPipe

For functions with multiple arguments.

```typescript
template: `<p>{{ join | apply : 'Hello' : 'world' : '!' }}</p>`;
```

```typescript
public join(...rest: string[]) {
  return rest.join(' ');
}
```

### Error Handling

Using non-pure functions will throw an error. For instance, using `updateClock`, which is not pure, would cause an error:

```typescript
public updateClock() {
  this.now = new Date();
  return this.now;
}
```

```html
<!-- Throws Error -->
<!-- <h1>THIS IS NOT PURE: {{ updateClock | apply }}</h1> -->
```

The function `updateClock` modifies the state (`this.now`), making it a non-pure function. Using it with `ApplyPipe` or `CallPipe` will result in an error.

## API

### Inputs for CallPipe

- `value: T`
- `args: (param: T) => R`

### Inputs for ApplyPipe

- `fn: TFunction`
- `...args: Parameters<TFunction>`

### Validation

- Throws an error if a non-pure function is used.
- Throws an error if `this` is used inside the function body.

Both pipes are designed to work with Angular's pure pipe memoization, providing an efficient way to pass arguments to pure functions.
