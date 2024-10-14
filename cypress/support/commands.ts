/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
import { SecretRobot } from '../robots/secret.robot';
import { HomeRobot } from '../robots/home.robot';
import { DashboardRobot } from '../robots/dashboard.robot';

declare global {
    namespace Cypress {
        interface Chainable {
            importAccount: (seed, password?) => void;
            removeWallet: () => void;
            setDashboardCardView: () => void;
            assertValueCopiedToClipboard: (value) => void;
        }
    }
}

/* https://dev.to/walmyrlimaesilv/testing-copy-to-clipboard-with-cypress-1414 */
Cypress.Commands.add('assertValueCopiedToClipboard', (value) => {
    cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
            console.log(text);
            expect(text).to.eq(value);
        });
    });
});

Cypress.Commands.add('setDashboardCardView' as any, () => {
    window.localStorage.setItem('bananostand_dashboardView', 'card');
});

Cypress.Commands.add(
    'importAccount' as any,
    (seed: string, password: string = 'test') => {
        new HomeRobot().clickEnterSecret();

        new SecretRobot()
            .enterSecret(seed)
            .clickNext()
            .enterPassword(password)
            .clickNext();

        new DashboardRobot().checkDashboardExists();
    }
);

Cypress.Commands.add('removeWallet' as any, () => {
    new DashboardRobot().clickWalletActions().clickRemoveWallet();
    cy.wait(2000);
});
Cypress.Commands.add('copyMnemonicPhrase' as any, () => {
    new DashboardRobot().clickWalletActions().clickCopyMnemonic();
    cy.wait(2000);
});
Cypress.Commands.add('copySeed' as any, () => {
    new DashboardRobot().clickWalletActions().clickCopySeed();
    cy.wait(2000);
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
