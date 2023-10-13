describe('activeElement', () => {
	beforeEach(() => cy.visit('/active-element'));

	it('should emit the focussed button', () => {
		cy.get('button').eq(1).as('buttonToFocus');
		cy.get('span').as('focussedElementHTML');

		cy.get('@buttonToFocus').focus();
		cy.get('@focussedElementHTML').should('contain.text', 'btn2');
	});
});
