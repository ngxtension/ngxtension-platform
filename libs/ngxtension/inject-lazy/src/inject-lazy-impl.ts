import {
	DestroyRef,
	ENVIRONMENT_INITIALIZER,
	EnvironmentInjector,
	Injectable,
	Injector,
	Type,
	createEnvironmentInjector,
	inject,
	type Provider,
	type ProviderToken,
} from '@angular/core';
import type { Observable } from 'rxjs';
import { defer } from 'rxjs';

/**
 * Lazy import type that includes default and normal imports
 */
export type LazyImportLoaderFn<T> = () =>
	| Promise<ProviderToken<T>>
	| Promise<{ default: ProviderToken<T> }>;

@Injectable({ providedIn: 'root' })
export class InjectLazyImpl<T> {
	private overrides = new WeakMap(); // no need to clean up
	override<T>(type: Type<T>, mock: Type<unknown>) {
		this.overrides.set(type, mock);
	}

	get(injector: Injector, loader: LazyImportLoaderFn<T>): Observable<T> {
		return defer(() =>
			loader().then((serviceOrDefault) => {
				const type =
					'default' in serviceOrDefault
						? serviceOrDefault.default
						: serviceOrDefault;

				// Check if we have overrides, O(1), low overhead
				if (this.overrides.has(type)) {
					const module = this.overrides.get(type);
					return new module();
				}

				// If the service uses DestroyRef.onDestroy() it will never be called.
				// Even if injector is a NodeInjector, this works only with providedIn: root.
				// So it's the root injector that will provide the DestroyRef (and thus never call OnDestroy).
				// The solution would be to create an EnvironmentInjector that provides the class we just lazy-loaded.
				if (!(injector instanceof EnvironmentInjector)) {
					// We're passing a node injector to the function

					// This is the DestroyRef of the component
					const destroyRef = injector.get(DestroyRef);

					// This is the parent injector of the environmentInjector we're creating
					const environmentInjector = injector.get(EnvironmentInjector);

					// Creating an environment injector to destroy it afterward
					const newInjector = createEnvironmentInjector(
						[type as Provider],
						environmentInjector,
					);

					// Destroy the injector to trigger DestroyRef.onDestroy on our service
					destroyRef.onDestroy(() => newInjector.destroy());

					// We want to create the new instance of our service with our new injector
					injector = newInjector;
				}

				return injector.get(type)!;
			}),
		);
	}
}

/**
 * Helper function to mock the lazy-loaded module in `injectAsync`
 *
 * @usage
 * TestBed.configureTestingModule({
 *   providers: [
 *     mockLazyProvider(SandboxService, fakeSandboxService)
 *   ]
 * });
 */
export function mockLazyProvider<T>(type: Type<T>, mock: Type<unknown>) {
	return [
		{
			provide: ENVIRONMENT_INITIALIZER,
			multi: true,
			useValue: () => {
				inject(InjectLazyImpl).override(type, mock);
			},
		},
	];
}
