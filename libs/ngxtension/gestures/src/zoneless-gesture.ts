import { createInjectionToken } from 'ngxtension/create-injection-token';

const [injectZonelessGesture, provideFn] = createInjectionToken(() => false);

function provideZonelessGesture() {
	return provideFn(true);
}

export { injectZonelessGesture, provideZonelessGesture };
