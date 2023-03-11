export class SecretRobot {
    enterSecret(secret: string): SecretRobot {
        cy.get('[data-cy=secret-input]').type(secret);
        return this;
    }

    clickNext(): SecretRobot {
        cy.get('[data-cy=secret-next]').click();
        return this;
    }

    enterPassword(password: string): SecretRobot {
        if (!password) {
            return this;
        }
        cy.get('[data-cy=password-input]').type(password);
        return this;
    }

    checkNextButtonNotExists(): SecretRobot {
        cy.get('[data-cy=secret-next]').should('not.exist');
        return this;
    }
}
