import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter([
			{
				path: 'resize',
				loadComponent: () => import('./resize/resize.component'),
			},
			{
				path: 'if-validator',
				loadComponent: () => import('./if-validator/if-validator.component'),
			},
			{
				path: 'track-by',
				loadComponent: () => import('./track-by/track-by.component'),
			},
			{
				path: 'intl',
				loadComponent: () => import('./intl/intl.component'),
			},
		]),
	],
};
