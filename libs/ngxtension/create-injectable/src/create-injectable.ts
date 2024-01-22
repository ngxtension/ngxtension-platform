import {
	InjectionToken,
	type EnvironmentProviders,
	type Provider,
} from '@angular/core';
import {
	createInjectionToken,
	type CreateInjectionTokenDeps,
	type CreateInjectionTokenOptions,
} from 'ngxtension/create-injection-token';

export type CreateInjectableOptions<
	TFactory extends (...args: any[]) => object,
	TFactoryDeps extends Parameters<TFactory> = Parameters<TFactory>,
> = (TFactoryDeps[0] extends undefined
	? { deps?: never }
	: { deps: CreateInjectionTokenDeps<TFactory, TFactoryDeps> }) & {
	isRoot?: boolean;
	token?: InjectionToken<ReturnType<TFactory>>;
	extraProviders?: Provider | EnvironmentProviders;
};

export function createInjectable<
	TFactory extends (...args: any[]) => object,
	TFactoryDeps extends Parameters<TFactory> = Parameters<TFactory>,
	TOptions extends CreateInjectionTokenOptions<
		TFactory,
		TFactoryDeps
	> = CreateInjectableOptions<TFactory, TFactoryDeps>,
>(factory: TFactory, options?: TOptions): InjectionToken<ReturnType<TFactory>> {
	return createInjectionToken(factory, options)[2];
}
