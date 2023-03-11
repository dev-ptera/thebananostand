declare const cy;

export class DashboardRobot {
    checkDashboardExists(): DashboardRobot {
        cy.get('[data-cy=dashboard-wrapper]').should('exist');
        return this;
    }

    checkDashboardNotExists(): DashboardRobot {
        cy.get('[data-cy=dashboard-wrapper]').should('not.exist');
        return this;
    }

    clickWalletActions(): DashboardRobot {
        cy.get('[data-cy=wallet-actions-desktop-menu]').click();
        return this;
    }

    clickRemoveWallet(): DashboardRobot {
        cy.get('[data-cy=remove-wallet-button]').trigger('mousedown', {
            button: 0,
        });
        return this;
    }

    countLoadedAccounts(expectedSize: number): DashboardRobot {
        cy.get('[data-cy=dashboard-account-card-footer]').should(
            'have.length',
            expectedSize
        );
        return this;
    }
}
