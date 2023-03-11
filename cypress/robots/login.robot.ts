declare const cy;

export class LoginRobot {
    checkLoginPagNotExists(): LoginRobot {
        cy.get('[data-cy=login-wrapper]').should('not.exist');
        return this;
    }

    checkLoginPageExists(): LoginRobot {
        cy.get('[data-cy=login-wrapper]').should('exist');
        return this;
    }

    clearPassword(): LoginRobot {
        cy.get('[data-cy=active-wallet-password-input]').clear();
        return this;
    }

    enterPassword(password: string): LoginRobot {
        cy.get('[data-cy=active-wallet-password-input]').type(password);
        return this;
    }

    clickUnlockButton(): LoginRobot {
        cy.get('[data-cy=account-unlock-button]').click();
        return this;
    }
}
