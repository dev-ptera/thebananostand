export class SettingsRobot {
    clickSettings(): SettingsRobot {
        cy.get('[data-cy=settings-button]').click();
        return this;
    }

    clickAdvancedSettingsMenuOption(): SettingsRobot {
        cy.get('[data-cy=more-settings]').click();
        return this;
    }

    clickChangePassword(): SettingsRobot {
        cy.get('[data-cy=change-password-button]').click();
        return this;
    }

    clearLocalStorage(): SettingsRobot {
        cy.get('[data-cy=clear-storage-button]').trigger('mousedown', {
            button: 0,
        });
        cy.wait(2000);
        return this;
    }
}
