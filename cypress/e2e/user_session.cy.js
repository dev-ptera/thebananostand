describe("User Session", () => {

    const LOW_FUND_SEED = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const root = 'http://localhost:4200'
    const defaultPasswordForTesting = 'SamplePasswordTest123';


    const reload = () => {
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
    }

    beforeEach(() => {
        cy.clearLocalStorage();
        reload();
    });

    const logInUsingSeedPasswordPair = (password) => {
        let userPassword = password;
        if (!password) {
            userPassword = defaultPasswordForTesting;
        }
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=password-input]').type(userPassword);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=secret-next]').should('not.exist');
    }


    it("should login with just a seed (no password)", () => {
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=secret-next]').should('not.exist'); // Waits for the New Seed window to dismiss.
        reload();
        cy.window().then(() => {

            cy.get('[data-cy=login-wrapper]');
            cy.get('[data-cy=account-unlock-button]').click();
            cy.get('[data-cy=dashboard-wrapper]');
            }
        );
    });

    it("should login with a seed and password", () => {
        const password = 'UniquePasswordForTestingSpec';
        logInUsingSeedPasswordPair(password);
        reload();
        cy.get('[data-cy=login-wrapper]');
        cy.get('[data-cy=active-wallet-password-input]').type(password);
        cy.get('[data-cy=account-unlock-button]').click();
        cy.get('[data-cy=dashboard-wrapper]');
    });

    it("should not allow an incorrect password to login", () => {
        const incorrectPassword = 'SamplePasswordTest123!!'
        logInUsingSeedPasswordPair();
        reload();
        cy.get('[data-cy=login-wrapper]');
        cy.get('[data-cy=active-wallet-password-input]').type(incorrectPassword);
        cy.get('[data-cy=account-unlock-button]').click();
        cy.get('[data-cy=login-wrapper]');
    });

    const removeWallet = () => {
        cy.get('[data-cy=wallet-actions-menu]').click();
        cy.get('[data-cy=remove-wallet-button]').trigger('mousedown', { button: 0 });
        cy.wait(2000);
    }

    it("should clear a user's encrypted secret", () => {
        logInUsingSeedPasswordPair();
        cy.window().then((window) => {
           void expect(window.localStorage.getItem('bananostand_encryptedWallets')).to.be.ok;
        });
        removeWallet();
        cy.window().then((window) => {
            void expect(window.localStorage.getItem('bananostand_encryptedWallets')).to.not.be.ok;
        });
    });

    it("should navigate user back to home screen & display snackbar when secret is cleared", () => {
        logInUsingSeedPasswordPair();

        cy.window().then(() => {
            cy.get('[data-cy=dashboard-wrapper]').should('exist');
        });
        removeWallet();
        cy.window().then(() => {
            cy.get('[data-cy=dashboard-wrapper]').should('not.exist');
            cy.get('.mat-snack-bar-container').contains('Removed Wallet');
        });
    });

    it("should log a user out after changing password", () => {
        logInUsingSeedPasswordPair();

        cy.window().then(() => {
            cy.get('[data-cy=dashboard-wrapper]').should('exist');
            cy.get('[data-cy=session-settings]').click();
            cy.get('[data-cy=change-password-button]').click()
            cy.get('.change-password-overlay').should('exist');
            const newPassword = 'ABD123XYZ';
            const overlayRenderDelay = 500;
            cy.wait(overlayRenderDelay);
            cy.get('[data-cy=current-password-input]').type(defaultPasswordForTesting);
            cy.get('[data-cy=new-password-input]').type(newPassword);
            cy.get('[data-cy=confirm-password-input]').type(newPassword);
            cy.get('[data-cy=confirm-change-password-button]').click();
            cy.get('[data-cy=dashboard-wrapper]').should('not.exist');
            cy.get('.change-password-overlay').should('not.exist');
            cy.get('[data-cy=login-wrapper]');
        })
    });

    it("should, after changing password, require new password to view accounts ", () => {
        logInUsingSeedPasswordPair();
        const newPassword = 'ABD123XYZ';
        const incorrectPassword = 'ABC123XYZ';

        cy.window().then(() => {
            cy.get('[data-cy=dashboard-wrapper]').should('exist');
            cy.get('[data-cy=session-settings]').click();
            cy.get('[data-cy=change-password-button]').click();
            const overlayRenderDelay = 500;
            cy.wait(overlayRenderDelay);

            // Change Password
            cy.get('[data-cy=current-password-input]').type(defaultPasswordForTesting);
            cy.get('[data-cy=new-password-input]').type(newPassword);
            cy.get('[data-cy=confirm-password-input]').type(newPassword);
            cy.get('[data-cy=confirm-change-password-button]').click();

            // Log In
            cy.get('[data-cy=active-wallet-password-input]').type(incorrectPassword);
            cy.get('[data-cy=account-unlock-button]').click();
            cy.get('[data-cy=login-wrapper]');
            cy.get('[data-cy=active-wallet-password-input]').clear();
            cy.get('[data-cy=active-wallet-password-input]').type(newPassword);
            cy.get('[data-cy=account-unlock-button]').click();

            // Confirm account loads
            cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 1);
        })
    });
});
