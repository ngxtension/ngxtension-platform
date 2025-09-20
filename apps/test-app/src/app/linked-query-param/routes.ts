import { Routes } from '@angular/router';
import LinkedQueryParamArrayCmp from './linked-query-param-array.component';
import LinkedQueryParamStringCmp from './linked-query-param-basic.component';
import LinkedQueryParamBooleansCmp from './linked-query-param-booleans.component';
import LinkedQueryParamDynamicCmp from './linked-query-param-dynamic.component';
import LinkedQueryParamInsideObjectCmp from './linked-query-param-insideObject.component';
import LinkedQueryParamNumberCmp from './linked-query-param-number.component';
import LinkedQueryParamObjectCmp from './linked-query-param-object.component';
import LinkedQueryParamCmp from './linked-query-param.component';

export const routes: Routes = [
	{
		path: '',
		component: LinkedQueryParamCmp,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'string',
			},
			{
				path: 'string',
				component: LinkedQueryParamStringCmp,
			},
			{
				path: 'booleans',
				component: LinkedQueryParamBooleansCmp,
			},
			{
				path: 'number',
				component: LinkedQueryParamNumberCmp,
			},
			{
				path: 'object',
				component: LinkedQueryParamObjectCmp,
			},
			{
				path: 'inside-object',
				component: LinkedQueryParamInsideObjectCmp,
			},
			{
				path: 'array',
				component: LinkedQueryParamArrayCmp,
			},
			{
				path: 'dynamic',
				component: LinkedQueryParamDynamicCmp,
			},
		],
	},
];
