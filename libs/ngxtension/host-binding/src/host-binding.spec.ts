import {
	Component,
	Injector,
	OnInit,
	computed,
	inject,
	signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { hostBinding } from './host-binding';

type FakeControl = {
	valid: boolean;
	value: number[];
};

@Component({
	standalone: true,
	template: '',
})
class TestHost {
	fakeControl = signal<FakeControl>({
		valid: true,
		value: [],
	});

	// class binding
	valid = hostBinding(
		'class.valid',
		computed(() => this.fakeControl().valid)
	);

	invalid = hostBinding(
		'class.invalid',
		computed(() => !this.valid())
	);

	// style binding
	color = hostBinding(
		'style.color',
		computed(() => (this.valid() ? 'green' : 'red'))
	);

	// style binding with a style unit extension
	width = hostBinding('style.width.px', signal(500));

	// attribute binding
	required = hostBinding('attr.aria-required', signal(false));

	// property binding
	id = hostBinding(
		'id',
		computed(() => (this.fakeControl().value.length ? 'filled' : 'empty'))
	);
}

describe(hostBinding.name, () => {
	const setup = (updatedFakeControl?: Partial<FakeControl>) => {
		const fixture = TestBed.createComponent(TestHost);
		fixture.detectChanges();

		if (updatedFakeControl) {
			fixture.componentInstance.fakeControl.update((ctrl) => ({
				...ctrl,
				...updatedFakeControl,
			}));

			fixture.detectChanges();
		}

		return { fixture };
	};

	describe('class binding', () => {
		it('should bind the "valid" class but no "invalid"', () => {
			const { fixture } = setup();

			expect(fixture.nativeElement.classList).toContain('valid');
			expect(fixture.nativeElement.classList).not.toContain('invalid');
		});

		it('should bind the "invalid" class but no "valid"', () => {
			const { fixture } = setup({ valid: false });

			expect(fixture.nativeElement.classList).toContain('invalid');
			expect(fixture.nativeElement.classList).not.toContain('valid');
		});
	});

	describe('style binding', () => {
		it('should bind the "green" color', () => {
			const { fixture } = setup();

			expect(fixture.nativeElement.style.color).toEqual('green');
		});

		it('should bind the "red" color', () => {
			const { fixture } = setup({ valid: false });

			expect(fixture.nativeElement.style.color).toEqual('red');
		});

		it('should bind the width to "500px"', () => {
			const { fixture } = setup();

			expect(fixture.nativeElement.style.width).toEqual('500px');
		});
	});

	describe('attribute binding', () => {
		it('should bind the aria-required to "false"', () => {
			const { fixture } = setup();

			expect(fixture.nativeElement.getAttribute('aria-required')).toEqual(
				'false'
			);
		});
	});

	describe('propery binding', () => {
		it('should bind the "empty" id', () => {
			const { fixture } = setup();

			expect(fixture.nativeElement.id).toEqual('empty');
		});

		it('should bind the "filled" id', () => {
			const { fixture } = setup({ value: [1] });

			expect(fixture.nativeElement.id).toEqual('filled');
		});
	});

	describe('out of injection context', () => {
		const component = (
			options: { addInjector?: boolean } = { addInjector: false }
		) => {
			@Component({ standalone: true, template: '' })
			class Comp implements OnInit {
				injector = inject(Injector);

				ngOnInit() {
					hostBinding(
						'',
						signal(null),
						options?.addInjector ? this.injector : undefined
					);
				}
			}
			return Comp;
		};

		it('should throw', () => {
			const fixture = TestBed.createComponent(component());

			expect(() => fixture.detectChanges()).toThrow();
		});

		it('should not throw', () => {
			const fixture = TestBed.createComponent(component({ addInjector: true }));

			expect(() => fixture.detectChanges()).not.toThrow();
		});
	});
});
