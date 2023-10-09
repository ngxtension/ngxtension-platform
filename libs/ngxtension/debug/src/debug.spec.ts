import { EMPTY, from, map } from 'rxjs';
import { debug } from './debug';

let consoleArgs: any[] = [];
const mockConsole =
	(type: 'L' | 'W' | 'E') =>
	(...args: any[]) => {
		if (
			typeof args[0] === 'string' &&
			args[0].length === 24 &&
			args[0][10] === 'T' &&
			args[0].endsWith('Z')
		)
			args[0] = type; //ignore Date.ToISOString() and replace it with type
		consoleArgs.push(args);
	};

describe(debug.name, () => {
	it('given an observable that complete >| should console.warn completed', () => {
		//MOCKING CONSOLE
		const origConsole = { ...console };
		consoleArgs = [];
		console.log = mockConsole('L');
		console.warn = mockConsole('W');
		console.error = mockConsole('E');

		const in$ = EMPTY;
		const out$ = in$.pipe(debug('test3'));

		let out = '>';
		out$.subscribe({
			next(s) {
				out += s + '-';
			},
			error(e) {
				out += e + 'X';
			},
			complete() {
				out += '|';
			},
		});
		expect(out).toEqual('>|');
		expect(consoleArgs.length).toEqual(1);
		expect(consoleArgs[0]).toEqual(['W', '[test3: Completed]']);

		//RESTORE CONSOLE
		console.log = origConsole.log;
		console.warn = origConsole.warn;
		console.error = origConsole.error;
		consoleArgs = [];
	});

	it('given an observable that throw >1-X should console.log emitted values until console.error', () => {
		//MOCKING CONSOLE
		const origConsole = { ...console };
		consoleArgs = [];
		console.log = mockConsole('L');
		console.warn = mockConsole('W');
		console.error = mockConsole('E');

		const in$ = from([1, 2, 3]);
		const out$ = in$.pipe(
			map((n) => {
				if (n % 2) return n;
				else throw '[ERR]';
			}),
			debug('test2')
		);

		let out = '>';
		out$.subscribe({
			next(s) {
				out += s + '-';
			},
			error(e) {
				out += e + 'X';
			},
			complete() {
				out += '|';
			},
		});
		expect(out).toEqual('>1-[ERR]X');
		expect(consoleArgs.length).toEqual(2);
		expect(consoleArgs[0]).toEqual(['L', '[test2: Next]', 1]);
		expect(consoleArgs[1]).toEqual(['E', '[test2: Error]', '[ERR]']);

		//RESTORE CONSOLE
		console.log = origConsole.log;
		console.warn = origConsole.warn;
		console.error = origConsole.error;
		consoleArgs = [];
	});

	it('given an observable >1-2-3| should console.log all emitted values + warn completed', () => {
		//MOCKING CONSOLE
		const origConsole = { ...console };
		consoleArgs = [];
		console.log = mockConsole('L');
		console.warn = mockConsole('W');
		console.error = mockConsole('E');

		const in$ = from([1, 2, 3]);
		const out$ = in$.pipe(debug('test1'));

		let out = '>';
		out$.subscribe({
			next(s) {
				out += s + '-';
			},
			error(e) {
				out += e + 'X';
			},
			complete() {
				out += '|';
			},
		});
		expect(out).toEqual('>1-2-3-|');
		expect(consoleArgs.length).toEqual(4);
		expect(consoleArgs[0]).toEqual(['L', '[test1: Next]', 1]);
		expect(consoleArgs[1]).toEqual(['L', '[test1: Next]', 2]);
		expect(consoleArgs[2]).toEqual(['L', '[test1: Next]', 3]);
		expect(consoleArgs[3]).toEqual(['W', '[test1: Completed]']);

		//RESTORE CONSOLE
		console.log = origConsole.log;
		console.warn = origConsole.warn;
		console.error = origConsole.error;
		consoleArgs = [];
	});
});
