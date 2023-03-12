export class OverlayRobot {
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
}
