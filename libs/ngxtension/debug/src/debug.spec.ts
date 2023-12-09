import { EMPTY, NEVER, from, map, tap } from 'rxjs';
import { debug } from './debug';

let consoleArgs: any[] = [];
const mockConsole =
	(type: 'L' | 'W' | 'E' | 'I') =>
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
	const origConsole = { ...console };

	beforeEach(() => {
		//MOCKING CONSOLE
		consoleArgs = [];
		console.log = mockConsole('L');
		console.warn = mockConsole('W');
		console.error = mockConsole('E');
		console.info = mockConsole('I');
	});

	afterEach(() => {
		//RESTORE CONSOLE
		console.log = origConsole.log;
		console.warn = origConsole.warn;
		console.error = origConsole.error;
		console.info = origConsole.info;
		consoleArgs = [];
	});

	it('given an observable that complete >| should console.warn completed', () => {
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
	});

	it('given an observable that throw >1-X should console.log emitted values until console.error', () => {
		const in$ = from([1, 2, 3]);
		const out$ = in$.pipe(
			map((n) => {
				if (n % 2) return n;
				else throw '[ERR]';
			}),
			debug('test2'),
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
	});

	it('given an observable >1-2-3| should console.log all emitted values + warn completed', () => {
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
	});

	it('given an observable >1-2-3| should console.info subscribe + log all emitted values + warn completed + info finalized', () => {
		const in$ = from([1, 2, 3]);
		const out$ = in$.pipe(debug('test4', { subscribe: true, finalize: true }));

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
		expect(consoleArgs.length).toEqual(6);
		expect(consoleArgs[0]).toEqual(['I', '[test4: Subscribed]']);
		expect(consoleArgs[1]).toEqual(['L', '[test4: Next]', 1]);
		expect(consoleArgs[2]).toEqual(['L', '[test4: Next]', 2]);
		expect(consoleArgs[3]).toEqual(['L', '[test4: Next]', 3]);
		expect(consoleArgs[4]).toEqual(['W', '[test4: Completed]']);
		expect(consoleArgs[5]).toEqual(['I', '[test4: Finalized]']);
	});

	it('given an observable that unsubscribe >! should console.info unsubscribe + finalize', () => {
		const in$ = NEVER;
		const out$ = in$.pipe(
			debug('test5', { unsubscribe: true, finalize: true }),
		);

		let out = '>';
		out$
			.pipe(
				tap({
					next(s) {
						out += s + '-';
					},
					error(e) {
						out += e + 'X';
					},
					complete() {
						out += '|';
					},
					unsubscribe() {
						out += '!';
					},
				}),
			)
			.subscribe()
			.unsubscribe();
		expect(out).toEqual('>!');
		expect(consoleArgs.length).toEqual(2);
		expect(consoleArgs[0]).toEqual(['I', '[test5: Unsubscribed]']);
		expect(consoleArgs[1]).toEqual(['I', '[test5: Finalized]']);
	});
});
