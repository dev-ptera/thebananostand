export class AccountRobot {
    checkAccountPageExists(): AccountRobot {
        cy.get('[data-cy=account-page]').click();
        return this;
    }

    checkTransactionsLoaded(): AccountRobot {
        cy.get('[data-cy=account-scroll-container]')
            .find('.transaction-row-wrapper')
            .its('length')
            .should('be.gte', 2);
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
}
