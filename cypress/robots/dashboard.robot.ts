export class DashboardRobot {
    checkDashboardExists(): DashboardRobot {
        cy.get('[data-cy=dashboard-wrapper]').should('exist');
        return this;
    }

    clickAddNextAccountDesktop(): DashboardRobot {
        cy.get('[data-cy=add-next-account-button]').click();
        return this;
    }

    clickAddNextAccountMobile(): DashboardRobot {
        cy.get('[data-cy=account-actions-mobile-menu]').click();
        cy.get('[data-cy=add-next-account-button]').click();
        return this;
    }

    clickCopySeed(): DashboardRobot {
        cy.get('[data-cy=copy-seed-button]').click();
        return this;
    }

    checkDashboardNotExists(): DashboardRobot {
        cy.get('[data-cy=dashboard-wrapper]').should('not.exist');
        return this;
    }

    clickCopyMnemonic(): DashboardRobot {
        cy.get('[data-cy=copy-mnemonic-button]').click();
        return this;
    }

    clickRefreshMobile(): DashboardRobot {
        cy.get('[data-cy=account-actions-mobile-menu]').click();
        cy.get('[data-cy=refresh-dashboard-button]').click();
        return this;
    }

    clickRefreshDesktop(): DashboardRobot {
        cy.get('[data-cy=refresh-dashboard-button]').click();
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

    clickAddSpecificAccountDesktop(): DashboardRobot {
        cy.get('[data-cy=add-specific-account-button]').click();
        return this;
    }

    clickAddSpecificAccountMobile(): DashboardRobot {
        cy.get('[data-cy=account-actions-mobile-menu]').click();
        cy.get('[data-cy=add-specific-account-button]').click();
        return this;
    }

    clickAccountNumber(i: number): DashboardRobot {
        cy.get('[data-cy=dashboard-account-cards-container]')
            .find(`[data-cy=dashboard-account-card-footer-${i}]`)
            .click();
        return this;
    }

    countLoadedAccounts(expectedSize: number): DashboardRobot {
        cy.get('[data-cy=dashboard-account-card]').should(
            'have.length',
            expectedSize
        );
        return this;
    }

    checkSpecificAccountNumberExists(i: number): DashboardRobot {
        cy.get('[data-cy=dashboard-account-cards-container]')
            .find('[data-cy=account-number]')
            .contains(`#${i}`);
        return this;
    }
}
