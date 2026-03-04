import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectText, waitFor } from './waitfor';

@Component({
	selector: 'test-component',
	standalone: true,
	template: `
		{{ text }}
	`,
})
class TestComponent {
	text = 'initial';
}

describe('waitFor', () => {
	it('should resolve immediately if condition matches', async () => {
		const result = await waitFor(() => 'success');
		expect(result).toBe('success');
	});

	it('should retry until condition matches', async () => {
		let count = 0;
		const result = await waitFor(
			() => {
				count++;
				if (count < 3) throw new Error('not yet');
				return 'success';
			},
			{ interval: 10 },
		);
		expect(result).toBe('success');
		expect(count).toBe(3);
	});

	it('should fail after timeout', async () => {
		await expect(
			waitFor(
				() => {
					throw new Error('fail');
				},
				{ timeout: 50, interval: 10 },
			),
		).rejects.toThrow(/Timed out/);
	});
});

describe('expectText', () => {
	let component: TestComponent;
	let fixture: any;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestComponent],
		}).compileComponents();
		fixture = TestBed.createComponent(TestComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should find text content', async () => {
		await expectText('initial');
	});

	it('should wait for text update', async () => {
		setTimeout(() => {
			component.text = 'updated';
			fixture.detectChanges();
		}, 50);

		await expectText('updated', { timeout: 200, interval: 10 });
	});

	it('should match regex', async () => {
		setTimeout(() => {
			component.text = 'complex value';
			fixture.detectChanges();
		}, 50);

		await expectText(/complex/, { timeout: 200, interval: 10 });
	});

	it('should throw if text never appears', async () => {
		await expect(
			expectText('never appears', { timeout: 50, interval: 10 }),
		).rejects.toThrow(/Timed out/);
	});
});
