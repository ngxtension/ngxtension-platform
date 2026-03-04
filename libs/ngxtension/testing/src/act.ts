import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * Executes a function and waits for the application to stabilize.
 *
 * This utility helps in testing async state transitions by ensuring that
 * any scheduled effects or microtasks are processed before the promise resolves.
 *
 * @param fn The function to execute.
 * @returns A promise that resolves to the result of the function after stability.
 */
export async function act<T>(fn: () => T): Promise<T> {
	const result = fn();
	await TestBed.inject(ApplicationRef).whenStable();
	return result;
}
