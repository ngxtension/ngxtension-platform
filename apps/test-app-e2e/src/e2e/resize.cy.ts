describe('resize', () => {
	beforeEach(() => cy.visit('/resize'));

	it('should react to viewport resize', () => {
		cy.viewport(500, 500);
		cy.get('pre').should('contain.text', '"width": 500');

		cy.viewport(800, 800);
		cy.get('pre').should('contain.text', '"width": 800');
	});
});
