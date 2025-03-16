import { createSingletonProxy } from './singleton-proxy';

class TestClass {
	public value = 0;

	public method() {
		return 'called';
	}
}

describe('createSingletonProxy', () => {
	let createInstanceSpy: jest.Mock;
	let result: {
		proxy: TestClass;
		reset: () => void;
	};

	beforeEach(() => {
		// Create a spy on the instance creation
		createInstanceSpy = jest.fn().mockImplementation(() => new TestClass());
		result = createSingletonProxy(createInstanceSpy);
	});

	it('should create a proxy and a reset function', () => {
		expect(result.proxy).toBeTruthy();
		expect(result.reset).toBeInstanceOf(Function);
	});

	it('should not create an instance until a property is accessed', () => {
		// Just creating the proxy shouldn't call createInstance
		expect(createInstanceSpy).not.toHaveBeenCalled();
	});

	it('should create an instance when a property is accessed', () => {
		expect(createInstanceSpy).not.toHaveBeenCalled();

		// Access a property
		const value = result.proxy.value;

		// Should create an instance
		expect(createInstanceSpy).toHaveBeenCalledTimes(1);
		expect(value).toBe(0);
	});

	it('should create an instance when a method is called', () => {
		expect(createInstanceSpy).not.toHaveBeenCalled();

		// Call a method
		const returnValue = result.proxy.method();

		// Should create an instance
		expect(createInstanceSpy).toHaveBeenCalledTimes(1);
		expect(returnValue).toBe('called');
	});

	it('should reuse the same instance for multiple property accesses', () => {
		// Access a property
		result.proxy.value;

		// Access another property
		result.proxy.method();

		// Should only create the instance once
		expect(createInstanceSpy).toHaveBeenCalledTimes(1);
	});

	it('should create an instance when a property is set', () => {
		// Set a property
		result.proxy.value = 42;

		// Should create an instance
		expect(createInstanceSpy).toHaveBeenCalledTimes(1);

		// The property should be updated
		expect(result.proxy.value).toBe(42);
	});

	it('should reset the instance when calling reset', () => {
		// Access a property to create the instance
		result.proxy.value = 42;
		expect(createInstanceSpy).toHaveBeenCalledTimes(1);
		expect(result.proxy.value).toBe(42);

		// Reset the instance
		result.reset();

		// Access a property again, should create a new instance
		result.proxy.value;
		expect(createInstanceSpy).toHaveBeenCalledTimes(2);
		expect(result.proxy.value).toBe(0);
	});

	it('should maintain property values through multiple accesses', () => {
		// Set a property
		result.proxy.value = 42;
		expect(result.proxy.value).toBe(42);

		// Get the property - should still be 42
		expect(result.proxy.value).toBe(42);
	});
});
