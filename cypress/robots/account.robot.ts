/// <reference types="cypress"/>

export class AccountRobot {
    checkAccountPageExists(): AccountRobot {
        cy.get('[data-cy=account-page]').click();
        return this;
    }

    checkNoTransactionsLoaded(): AccountRobot {
        cy.get('[data-cy=account-scroll-container]').should('not.exist');
        return this;
    }

    checkTransactionsLoaded(): AccountRobot {
        cy.get('[data-cy=account-scroll-container]')
            .find('.transaction-row-wrapper')
            .its('length')
            .should('be.gte', 2);
        return this;
    }

    clickAccountActions(): AccountRobot {
        cy.get('[data-cy=account-actions-trigger]').click();
        return this;
    }

    checkLoadingIndicatorExists(): AccountRobot {
        cy.get('[data-cy=loading-indicator').should('exist');
        return this;
    }

    clickFilterButtonDesktop(): AccountRobot {
        cy.get('[data-cy=filter-button-desktop').click();
        return this;
    }

    clickFilterButtonMobile(): AccountRobot {
        cy.get('[data-cy=filter-button-mobile').click();
        return this;
    }

    checkLoadingIndicatorNotExists(): AccountRobot {
        cy.get('[data-cy=loading-indicator').should('not.exist');
        return this;
    }

    clickRefreshAccountMobile(): AccountRobot {
        cy.get('[data-cy=refresh-account-mobile]').click();
        return this;
    }

    clickRefreshAccountDesktop(): AccountRobot {
        cy.get('[data-cy=refresh-account-desktop]').click();
        return this;
    }

    clickChangeRepMobile(): AccountRobot {
        cy.get('[data-cy=change-rep-mobile]').click();
        return this;
    }

    clickSend(): AccountRobot {
        cy.get('[data-cy=send-action]').click();
        return this;
    }

    clickChangeRep(): AccountRobot {
        cy.get('[data-cy=change-action]').click();
        return this;
    }

    clickReceive(): AccountRobot {
        cy.get('[data-cy=receive-action]').click();
        return this;
    }

    clickCopyAddressDesktop(): AccountRobot {
        cy.get('[data-cy=copy-address-desktop]').click();
        return this;
    }

    clickCopyAddressMobile(): AccountRobot {
        cy.get('[data-cy=copy-address-mobile]').click();
        return this;
    }
}
