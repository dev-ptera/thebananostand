describe("User Session", () => {

    const LOW_FUND_SEED = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const root = 'http://localhost:4200'

    const reload = () => {
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
    }

    beforeEach(() => {
        cy.clearLocalStorage();
        reload();
    });

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
        const password = 'SamplePasswordTest123!'
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=password-input]').type(password);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=secret-next]').should('not.exist');
        reload();
        cy.get('[data-cy=login-wrapper]');
        cy.get('[data-cy=active-wallet-password-input]').type(password);
        cy.get('[data-cy=account-unlock-button]').click();
        cy.get('[data-cy=dashboard-wrapper]');
    });

    it("should not allow an incorrect password to login", () => {
        const password = 'SamplePasswordTest123!'
        const incorrectPassword = 'SamplePasswordTest123!!'
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=password-input]').type(password);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=secret-next]').should('not.exist');
        reload();
        cy.get('[data-cy=login-wrapper]');
        cy.get('[data-cy=active-wallet-password-input]').type(incorrectPassword);
        cy.get('[data-cy=account-unlock-button]').click();
        cy.get('[data-cy=login-wrapper]');
    });

    it("should clear a user's encrypted secret", () => {
        const password = 'SamplePasswordTest123!'
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=password-input]').type(password);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=secret-next]').should('not.exist');

        cy.window().then(
            (window) => {
               void expect(window.localStorage.getItem('bananostand_encryptedSeed')).to.be.ok;
            }
        );
        cy.get('[data-cy=account-settings]').click();
        cy.get('[data-cy=clear-data-button]').click();

        cy.window().then(
            (window) => {
                void expect(window.localStorage.getItem('bananostand_encryptedSeed')).to.not.be.ok;
            }
        );
    });
});
