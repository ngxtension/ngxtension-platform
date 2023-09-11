import { DestroyRef, Injector, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { Observable, Subscription } from 'rxjs';

/**
 * Connects a signal to an observable and returns a subscription. The subscription is automatically
 * unsubscribed when the component is destroyed. If it's not called in an injection context, it must
 * be called with an injector or DestroyRef.
 *
 *
 * Usage
 * ```ts
 * @Component({})
 * export class MyComponent {
 *  private dataService = inject(DataService);
 *
 *  data = signal([] as string[]);
 *
 *  constructor() {
 *    connect(this.data, this.dataService.data$);
 *  }
 * }
 * ```
 */
export function connect<T>(
	signal: WritableSignal<T>,
	observable: Observable<T>,
	injectorOrDestroyRef?: Injector | DestroyRef
): Subscription {
	let destroyRef = null;

	if (injectorOrDestroyRef instanceof DestroyRef) {
		destroyRef = injectorOrDestroyRef; // if it's a DestroyRef, use it
	} else {
		const injector = assertInjector(connect, injectorOrDestroyRef);
		destroyRef = injector.get(DestroyRef);
	}

	return observable
		.pipe(takeUntilDestroyed(destroyRef))
		.subscribe((x) => signal.set(x));
}
