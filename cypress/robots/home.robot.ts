export class HomeRobot {
    clickEnterSecret(): HomeRobot {
        cy.get('[data-cy=enter-secret]').click();
        return this;
    }

    checkHomePageExists(): HomeRobot {
        cy.get('[data-cy=home-wrapper]').should('exist');
        return this;
    }
}
