/// <reference types="cypress"/>

export class SigningRobot {
    // TODO: Remove this; should not be required.
    reasonableInputTimeEntryDelayMs = 1000;

    checkSigningPageExists(): SigningRobot {
        cy.get('[data-cy=signing-page]').should('exist');
        return this;
    }

    clickMessageSigningExpand(): SigningRobot {
        cy.get('[data-cy=message-signing-expand]').click();
        return this;
    }

    clickMessageVerificationExpand(): SigningRobot {
        cy.get('[data-cy=message-verification-expand]').click();
        return this;
    }

    enterMessage(message: string): SigningRobot {
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        cy.get('[data-cy=signing-input]').type(message);
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        return this;
    }

    enterVerificationAddress(address: string): SigningRobot {
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        cy.get('[data-cy=verification-address-input]').type(address);
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        return this;
    }

    enterVerificationMessage(message: string): SigningRobot {
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        cy.get('[data-cy=verification-message-input]').type(message);
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        return this;
    }

    enterVerificationSignature(sig: string): SigningRobot {
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        cy.get('[data-cy=verification-signature-input]').type(sig);
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        return this;
    }

    checkSignatureValid(): SigningRobot {
        cy.get('[data-cy=message-verification-button]')
            .click()
            .contains('Valid');
        return this;
    }

    checkSignatureInvalid(): SigningRobot {
        cy.get('[data-cy=message-verification-button]')
            .click()
            .contains('Invalid');
        return this;
    }

    clickMessageSignButton(): SigningRobot {
        cy.get('[data-cy=message-signing-button]').click();
        return this;
    }
    checkMessageSignButtonDisabled(): SigningRobot {
        cy.get('[data-cy=message-signing-button]').should('be.disabled');
        return this;
    }

    checkSignatureEquals(message: string): SigningRobot {
        cy.wait(this.reasonableInputTimeEntryDelayMs);
        cy.get('input[name="signature"]')
            .invoke('val')
            .then((val) => {
                expect(val).to.equal(message);
            });
        return this;
    }
}
