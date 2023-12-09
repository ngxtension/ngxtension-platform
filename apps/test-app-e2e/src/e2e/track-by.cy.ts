describe('track-by', () => {
	it('should track by properly', () => {
		cy.visit('/track-by');

		cy.get('[id=without-track-by]').as('withoutTrackBy');
		cy.get('[id=with-track-by]').as('withTrackBy');
		cy.get('[id=with-track-by-prop]').as('withTrackByProp');

		// initial
		assertCount(3 /* initial 3 */, 3 /* initial 3 */);

		// first click
		cy.get('button').click();
		assertCount(
			10 /* initial 3 + 7 (3 removed, 4 new) */,
			4 /* initial 3 + 1 new */,
		);

		// second click
		cy.get('button').click();
		assertCount(
			19 /* initial 3 + 7 (3 removed, 4 new) + 9 (4 removed, 5 new) */,
			5 /* initial 3 + 1 + 1 new */,
		);
	});
});

function assertCount(withoutTrackByCount: number, withTrackByCount: number) {
	cy.get('@withoutTrackBy').contains(withoutTrackByCount);
	cy.get('@withTrackBy').contains(withTrackByCount);
	cy.get('@withTrackByProp').contains(withTrackByCount);
}
