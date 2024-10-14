/// <reference types="cypress"/>
export class OverlayRobot {
    checkApiRequestOverlayExists(): OverlayRobot {
        cy.get('.api-request-overlay').should('exist');
        return this;
    }

    checkApiRequestOverlayNotExists(): OverlayRobot {
        cy.get('.api-request-overlay').should('not.exist');
        return this;
    }

    checkFilterOverlayNotExists(): OverlayRobot {
        cy.get('.filter-overlay').should('not.exist');
        return this;
    }
    checkFilterOverlayExists(): OverlayRobot {
        cy.get('.filter-overlay').should('exist');
        return this;
    }

    checkSendOverlayExists(): OverlayRobot {
        cy.get('.send-overlay').should('exist');
        return this;
    }

    checkSendOverlayNotExists(): OverlayRobot {
        cy.get('.send-overlay').should('not.exist');
        return this;
    }

    checkReceiveOverlayExists(): OverlayRobot {
        cy.get('.receive-overlay').should('exist');
        return this;
    }

    checkReceiveOverlayNotExists(): OverlayRobot {
        cy.get('.receive-overlay').should('not.exist');
        return this;
    }

    clickReceivedFilterChip(): OverlayRobot {
        cy.get('[data-cy=received-chip]').click();
        return this;
    }

    clickSentFilterChip(): OverlayRobot {
        cy.get('[data-cy=sent-chip]').click();
        return this;
    }

    clickChangeFilterChip(): OverlayRobot {
        cy.get('[data-cy=change-chip]').click();
        return this;
    }

    clickApplyFilter(): OverlayRobot {
        cy.get('[data-cy=apply-filter]').click();
        return this;
    }

    clickReceiveNextButton(): OverlayRobot {
        cy.get('[data-cy=receive-button]').click();
        return this;
    }

    clickCloseReceive(): OverlayRobot {
        cy.get('[data-cy=receive-close-button]').click();
        return this;
    }

    clickCloseSend(): OverlayRobot {
        cy.get('[data-cy=send-close-button]').click();
        return this;
    }

    checkChangeRepOverlayExists(): OverlayRobot {
        cy.get('.change-rep-overlay').should('exist');
        return this;
    }

    checkChangeRepOverlayNotExists(): OverlayRobot {
        cy.get('.change-rep-overlay').should('not.exist');
        return this;
    }

    clickCloseChangeRepOverlay(): OverlayRobot {
        cy.get('[data-cy=change-close-button]').click();
        return this;
    }

    clickSendNextButton(): OverlayRobot {
        cy.get('[data-cy=send-next-button]').click();
        return this;
    }

    clickCloseFilterButton(): OverlayRobot {
        cy.get('[data-cy=filter-close-button]').click();
        return this;
    }

    enterSendAmount(amount: string): OverlayRobot {
        cy.get('[data-cy=send-amount-input]').type(amount);
        return this;
    }

    enterRecipientAddress(address: string): OverlayRobot {
        cy.get('[data-cy=send-recipient-input]').type(address);
        return this;
    }

    checkSendLoading(): OverlayRobot {
        cy.get('[data-cy=send-loading]').should('exist');
        return this;
    }

    checkReceiveLoading(): OverlayRobot {
        cy.get('[data-cy=receive-loading]').should('exist');
        return this;
    }

    checkSendSuccess(): OverlayRobot {
        cy.get('[data-cy=send-success-state]').should('exist');
        return this;
    }

    checkReceiveSuccess(): OverlayRobot {
        cy.get('[data-cy=receive-success-state').should('exist');
        return this;
    }

    enterAddAccountNumber(i: number): OverlayRobot {
        cy.get('[data-cy=add-specific-account-input]').type('99');
        return this;
    }

    clickAddAccountButton(): OverlayRobot {
        cy.get('[data-cy=add-account-overlay-button]').click();
        return this;
    }

    checkAddAccountOverlayExists(): OverlayRobot {
        cy.get('.add-index-overlay').should('exist');
        return this;
    }

    checkAddAccountOverlayNotExists(): OverlayRobot {
        cy.get('.add-index-overlay').should('not.exist');
        return this;
    }

    checkApiRequestSendAmountEquals(amount: string): OverlayRobot {
        cy.get('[data-cy=api-request-send-amount]').contains(`${amount} BAN`);
        return this;
    }

    checkApiRequestActionAddressEquals(address: string): OverlayRobot {
        cy.get('[data-cy=api-request-action-address]').contains(address);
        return this;
    }

    clickApiRequestNextButton(): OverlayRobot {
        cy.get('[data-cy=api-request-next-button]').click();
        return this;
    }

    clickApiRequestBackButton(): OverlayRobot {
        cy.get('[data-cy=api-request-back-button]').click();
        return this;
    }

    selectApiRequestAccount(): OverlayRobot {
        cy.wait(1000); // wait for address list to populate
        cy.get('[data-cy=api-request-account-selection]')
            .click()
            .get('mat-option')
            .contains('ban_1z7rx')
            .click()
            .wait(100);
        return this;
    }
}
