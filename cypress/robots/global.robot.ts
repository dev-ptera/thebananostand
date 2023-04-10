/// <reference types="cypress"/>

export class GlobalRobot {
    encryptedKey = 'bananostand_encryptedWallets';

    checkSnackbarTextContains(text: string): GlobalRobot {
        cy.get('.mat-mdc-simple-snack-bar').contains(text);
        return this;
    }

    checkWalletLocalStorageExists(): GlobalRobot {
        cy.window().then((window) => {
            void expect(window.localStorage.getItem(this.encryptedKey)).to.be
                .ok;
        });
        return this;
    }

    checkWalletLocalStorageNotExists(): GlobalRobot {
        cy.window().then((window) => {
            void expect(window.localStorage.getItem(this.encryptedKey)).to.not
                .be.ok;
        });
        return this;
    }
}
