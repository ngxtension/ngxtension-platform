import { HttpContext, HttpContextToken } from '@angular/common/http';
import { mergeHttpContext } from './merge-http-context';

describe(mergeHttpContext.name, () => {
	const TOKEN_A = new HttpContextToken<string>(() => 'default_a');
	const TOKEN_B = new HttpContextToken<number>(() => 0);
	const TOKEN_C = new HttpContextToken<boolean>(() => false);
	const TOKEN_D = new HttpContextToken<string[]>(() => []);

	it('should return empty HttpContext when no contexts provided', () => {
		const result = mergeHttpContext();
		expect(result).toBeInstanceOf(HttpContext);
		expect(Array.from(result.keys())).toHaveLength(0);
	});

	it('should merge single context correctly', () => {
		const context = new HttpContext();
		context.set(TOKEN_A, 'value_a');

		const result = mergeHttpContext(context);

		expect(result.get(TOKEN_A)).toBe('value_a');
		expect(Array.from(result.keys())).toHaveLength(1);
	});

	it('should merge multiple contexts with different tokens', () => {
		const context1 = new HttpContext();
		const context2 = new HttpContext();
		const context3 = new HttpContext();

		context1.set(TOKEN_A, 'value_a');
		context2.set(TOKEN_B, 42);
		context3.set(TOKEN_C, true);

		const result = mergeHttpContext(context1, context2, context3);

		expect(result.get(TOKEN_A)).toBe('value_a');
		expect(result.get(TOKEN_B)).toBe(42);
		expect(result.get(TOKEN_C)).toBe(true);
		expect(Array.from(result.keys())).toHaveLength(3);
	});

	it('should handle complex value types', () => {
		const context1 = new HttpContext();
		const context2 = new HttpContext();

		context1.set(TOKEN_D, ['item1', 'item2']);
		context2.set(TOKEN_D, ['item3', 'item4']);

		const result = mergeHttpContext(context1, context2);

		expect(result.get(TOKEN_D)).toEqual(['item3', 'item4']);
		expect(Array.from(result.keys())).toHaveLength(1);
	});

	it('should preserve all tokens when merging multiple contexts', () => {
		const context1 = new HttpContext();
		const context2 = new HttpContext();

		context1.set(TOKEN_A, 'value_a');
		context1.set(TOKEN_B, 1);
		context2.set(TOKEN_C, true);
		context2.set(TOKEN_D, ['test']);

		const result = mergeHttpContext(context1, context2);

		expect(result.get(TOKEN_A)).toBe('value_a');
		expect(result.get(TOKEN_B)).toBe(1);
		expect(result.get(TOKEN_C)).toBe(true);
		expect(result.get(TOKEN_D)).toEqual(['test']);
		expect(Array.from(result.keys())).toHaveLength(4);
	});

	it('should handle undefined and null values', () => {
		const context1 = new HttpContext();
		const context2 = new HttpContext();

		const TOKEN_NULL = new HttpContextToken<string | null>(() => null);
		const TOKEN_UNDEFINED = new HttpContextToken<string | undefined>(
			() => undefined,
		);

		context1.set(TOKEN_NULL, null);
		context2.set(TOKEN_UNDEFINED, undefined);

		const result = mergeHttpContext(context1, context2);

		expect(result.get(TOKEN_NULL)).toBeNull();
		expect(result.get(TOKEN_UNDEFINED)).toBeUndefined();
		expect(Array.from(result.keys())).toHaveLength(2);
	});

	it('should maintain type safety for context tokens', () => {
		const STRING_TOKEN = new HttpContextToken<string>(() => '');
		const NUMBER_TOKEN = new HttpContextToken<number>(() => 0);

		const context1 = new HttpContext();
		const context2 = new HttpContext();

		context1.set(STRING_TOKEN, 'test');
		context2.set(NUMBER_TOKEN, 123);

		const result = mergeHttpContext(context1, context2);

		const stringValue: string = result.get(STRING_TOKEN);
		const numberValue: number = result.get(NUMBER_TOKEN);

		expect(typeof stringValue).toBe('string');
		expect(typeof numberValue).toBe('number');
	});

	it('should handle empty contexts in between non-empty contexts', () => {
		const context1 = new HttpContext();
		const context2 = new HttpContext();
		const context3 = new HttpContext();

		context1.set(TOKEN_A, 'value_a');
		context3.set(TOKEN_B, 42);

		const result = mergeHttpContext(context1, context2, context3);

		expect(result.get(TOKEN_A)).toBe('value_a');
		expect(result.get(TOKEN_B)).toBe(42);
		expect(Array.from(result.keys())).toHaveLength(2);
	});

	it('should handle edge cases gracefully', () => {
		const context = new HttpContext();

		// @ts-expect-error - Testing with invalid input
		expect(() => mergeHttpContext(null)).toThrow();

		// @ts-expect-error - Testing with invalid input
		expect(() => mergeHttpContext(undefined)).toThrow();

		// @ts-expect-error - Testing with invalid input
		expect(() => mergeHttpContext({}, context)).toThrow();
	});
});
