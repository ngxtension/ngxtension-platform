import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter([
			{
				path: 'resize',
				loadComponent: () => import('./resize/resize.component'),
			},
		]),
	],
};
