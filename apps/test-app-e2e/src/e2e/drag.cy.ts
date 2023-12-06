describe('drag', () => {
	beforeEach(() => cy.visit('/drag'));

	it('should update coord after drag', () => {
		cy.get('.pink-draggable-box > span').as('coordSpan');
		cy.get('.pink-draggable-box').as('box');
		cy.get('@coordSpan').should('contain.text', '0,0');

		cy.get('@box').trigger('pointerdown', {
			pointerId: 1,
			clientX: 0,
			clientY: 0,
		});
		cy.get('@box').trigger('pointermove', {
			pointerId: 1,
			clientX: 300,
			clientY: 300,
		});
		cy.get('@box').trigger('pointerup', { pointerId: 1 });

		cy.get('@coordSpan').should('contain.text', '300,300');
	});
});
