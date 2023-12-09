import { Pipe, type PipeTransform } from '@angular/core';

const error_this = function () {
	throw new Error(
		`DON'T USE this INSIDE A FUNCTION CALLED BY | call OR | apply IT MUST BE A PURE FUNCTION!`,
	);
};
const NOTHIS = !('Proxy' in window)
	? Object.seal({})
	: new Proxy(
			{},
			{
				get: error_this,
				set: error_this,
				deleteProperty: error_this,
				has: error_this,
			},
	  );

@Pipe({
	name: 'call',
	pure: true,
	standalone: true,
})
export class CallPipe implements PipeTransform {
	transform<T = any, R = any>(value: T, args?: (param: T) => R): R {
		if (typeof args !== 'function')
			throw new TypeError('You must pass a PURE funciton to | call');
		return args?.call(NOTHIS, value);
	}
}

@Pipe({
	name: 'apply',
	pure: true,
	standalone: true,
})
export class ApplyPipe implements PipeTransform {
	transform<TFunction extends (...args: any[]) => any>(
		fn: TFunction,
		...args: Parameters<TFunction>
	): ReturnType<TFunction> {
		if (typeof fn !== 'function')
			throw new TypeError('You must use | apply on a PURE function');
		return fn.apply(NOTHIS, args);
	}
}
