declare const cy;
export class ChangePasswordRobot {
    checkOverlayNotExists(): ChangePasswordRobot {
        cy.get('.change-password-overlay').should('not.exist');
        return this;
    }

    checkOverlayExists(): ChangePasswordRobot {
        cy.get('.change-password-overlay').should('exist');
        return this;
    }

    enterCurrentPassword(password: string): ChangePasswordRobot {
        cy.get('[data-cy=current-password-input]').type(password);
        return this;
    }
    enterNewPassword(password: string): ChangePasswordRobot {
        cy.get('[data-cy=new-password-input]').type(password);
        return this;
    }
    confirmNewPassword(password: string): ChangePasswordRobot {
        cy.get('[data-cy=confirm-password-input]').type(password, {
            force: true,
        }); // TODO: Cypress cannot click this, claims element overlay.
        return this;
    }

    clickChangePassword(): ChangePasswordRobot {
        cy.get('[data-cy=confirm-change-password-button]').click();
        return this;
    }
}
