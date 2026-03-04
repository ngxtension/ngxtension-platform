import {
	ApplicationRef,
	Component,
	provideExperimentalZonelessChangeDetection,
	signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { act } from './act';

describe('act', () => {
	let appRef: ApplicationRef;

	it('should return result', async () => {
		const result = await act(() => 'foo');
		expect(result).toBe('foo');
	});

	it('should wait for component value to be rendered', async () => {
		TestBed.configureTestingModule({
			providers: [provideExperimentalZonelessChangeDetection()],
		});
		@Component({
			selector: 'test-component',
			template: `
				{{ value() }}
			`,
		})
		class TestComponent {
			value = signal('initial');
		}

		const fixture = TestBed.createComponent(TestComponent);

		await act(() => {
			fixture.componentInstance.value.set('updated');
		});

		expect(fixture.nativeElement.textContent.trim()).toBe('updated');
	});
});
