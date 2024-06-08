/**
 * The optional "custom" Injector. If this is not provided, will be retrieved from the current injection context
 */
import type { Injector } from '@angular/core';

export type InjectorOptions = {
	injector?: Injector;
};
