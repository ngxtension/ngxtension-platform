import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideSvgSprites } from 'ngxtension/svg-sprite';

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
			{
				path: 'drag',
				loadComponent: () => import('./drag/drag.component'),
			},
			{
				path: 'active-element',
				loadComponent: () =>
					import('./active-element/active-element.component'),
			},
			{
				path: 'inject-document-visibility',
				loadComponent: () =>
					import(
						'./document-visibility-state/document-visibility-state.component'
					),
			},
			{
				path: 'control-error',
				loadComponent: () => import('./control-error/control-error.component'),
			},
			{
				path: 'svg-sprite',
				loadComponent: () => import('./svg-sprite/svg-sprite.component'),
				providers: [
					provideSvgSprites(
						{
							name: 'fa-regular',
							baseUrl: 'assets/fontawesome/sprites/regular.svg',
						},
						{
							name: 'fa-solid',
							baseUrl: 'assets/fontawesome/sprites/solid.svg',
						},
						{
							name: 'fa-brands',
							baseUrl: 'assets/fontawesome/sprites/brands.svg',
						},
					),
				],
			},
			{
				path: 'control-value-accessor',
				loadComponent: () =>
					import('./control-value-accessor/control-value-accessor'),
			},
		]),
	],
};
