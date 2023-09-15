import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ApplyPipe, CallPipe } from './call-apply';

describe(CallPipe.name, () => {
	const NOW = new Date(42, 42, 42, 42, 42, 42, 42);
	@Component({
		standalone: true,
		template: `
			<p>{{ now | call : ISOFormat }}</p>
			<b>{{ now | call : doSomething }}</b>
		`,
		imports: [CallPipe],
	})
	class Dummy {
		now = NOW;
		ISOFormat(d: Date) {
			return d.toISOString();
		}
		doSomething() {
			return 42;
		}
	}

	@Component({
		standalone: true,
		template: `
			{{ 'WILL FAIL' | call : notPureFn }}
		`,
		imports: [CallPipe],
	})
	class FailDummy {
		now = NOW;
		notPureFn() {
			this.now = new Date();
			return this.now.toISOString();
		}
	}

	it('can call PURE function with a param', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const elP = fixture.debugElement.query(By.css('p'));
		expect(elP.nativeElement.textContent).toContain(NOW.toISOString());
	});
	it('can call PURE function without params', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const elB = fixture.debugElement.query(By.css('b'));
		expect(elB.nativeElement.textContent).toContain('42');
	});
	it('will fail if the function is NOT PURE (using this in the body)', () => {
		expect(() => {
			const fixture = TestBed.createComponent(FailDummy);
			fixture.detectChanges();
		}).toThrowError(
			`DON'T USE this INSIDE A FUNCTION CALLED BY | call OR | apply IT MUST BE A PURE FUNCTION!`
		);
	});
});

describe(ApplyPipe.name, () => {
	const NOW = new Date(42, 42, 42, 42, 42, 42, 42);
	@Component({
		standalone: true,
		template: `
			<i>{{ IamPure | apply }}</i>
			<p>{{ ISOFormat | apply : now }}</p>
			<b>{{ doSomething | apply : 'Hello world' }}</b>
			<a>{{ doSomething | apply : 'Prova' : 1 : 2 : 3 }}</a>
		`,
		imports: [ApplyPipe],
	})
	class Dummy {
		now = NOW;
		IamPure = () => 42;
		ISOFormat(d: Date) {
			return d.toISOString();
		}
		doSomething(a: string, ...rest: number[]) {
			return rest.reduce((a, b) => a + b, a);
		}
	}

	@Component({
		standalone: true,
		template: `
			{{ notPureFn | apply }}
		`,
		imports: [ApplyPipe],
	})
	class FailDummy {
		now = NOW;
		notPureFn() {
			this.now = new Date();
			return this.now.toISOString();
		}
	}

	it('can apply PURE function without params', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const elI = fixture.debugElement.query(By.css('i'));
		expect(elI.nativeElement.textContent).toContain('42');
	});
	it('can apply PURE function with a param', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const elP = fixture.debugElement.query(By.css('p'));
		expect(elP.nativeElement.textContent).toContain(NOW.toISOString());
	});
	it('can apply PURE function with lesser param', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const elB = fixture.debugElement.query(By.css('b'));
		expect(elB.nativeElement.textContent).toContain('Hello world');
	});
	it('can apply PURE function with more rest param', () => {
		const fixture = TestBed.createComponent(Dummy);
		fixture.detectChanges();

		const elA = fixture.debugElement.query(By.css('a'));
		expect(elA.nativeElement.textContent).toContain('Prova123');
	});
	it('will fail if the function is NOT PURE (using this in the body)', () => {
		expect(() => {
			const fixture = TestBed.createComponent(FailDummy);
			fixture.detectChanges();
		}).toThrowError(
			`DON'T USE this INSIDE A FUNCTION CALLED BY | call OR | apply IT MUST BE A PURE FUNCTION!`
		);
	});
});
