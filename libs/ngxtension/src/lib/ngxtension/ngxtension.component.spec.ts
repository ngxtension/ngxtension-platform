import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxtensionComponent } from './ngxtension.component';

describe('NgxtensionComponent', () => {
	let component: NgxtensionComponent;
	let fixture: ComponentFixture<NgxtensionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NgxtensionComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(NgxtensionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
