describe('if-validator', () => {
	beforeEach(() => cy.visit('/if-validator'));

	it('should dynamically change form validation', () => {
		cy.get('pre').should('contain.text', 'Is Form Valid: true'); // Default shouldValidate is false, form valid
		cy.get('button').click(); // Click the btn change shouldValidate to true
		cy.get('pre').should('contain.text', 'Is Form Valid: false'); // Form invalid
		cy.get('input').type('ngxextension@ng.com'); // Type valid email text
		cy.get('pre').should('contain.text', 'Is Form Valid: true'); // Form valid
	});
});
