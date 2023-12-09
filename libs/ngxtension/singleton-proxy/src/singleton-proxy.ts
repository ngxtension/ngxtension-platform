/**
 * Original code by PMNDRS
 * Source: https://github.com/pmndrs/react-three-rapier
 * License: MIT License (or specify the appropriate license)
 *
 * Creates a proxy that will create a singleton instance of the given class
 * when a property is accessed, and not before.
 *
 * @returns A proxy and a reset function, so that the instance can created again
 */
export function createSingletonProxy<
	SingletonClass extends object,
	CreationFn extends () => SingletonClass = () => SingletonClass,
>(
	/**
	 * A function that returns a new instance of the class
	 */
	createInstance: CreationFn,
): { proxy: SingletonClass; reset: () => void } {
	let instance: SingletonClass | undefined;

	const handler: ProxyHandler<SingletonClass> = {
		get(_, prop) {
			if (!instance) {
				instance = createInstance();
			}
			return Reflect.get(instance!, prop);
		},
		set(_, prop, value) {
			if (!instance) {
				instance = createInstance();
			}
			return Reflect.set(instance!, prop, value);
		},
	};

	const proxy = new Proxy({} as SingletonClass, handler) as SingletonClass;

	const reset = () => {
		instance = undefined;
	};

	/**
	 * Return the proxy and a reset function
	 */
	return { proxy, reset };
}
