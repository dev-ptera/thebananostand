describe("User Session", () => {

    const LOW_FUND_SEED = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const root = 'http://localhost:4200'

    beforeEach(() => {
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
    });

    const reload = () => {
        const snapshotName = 'logged-in';
        cy.saveLocalStorage(snapshotName);
        cy.reload();
        cy.restoreLocalStorage(snapshotName);
    }

    it("should login with just a seed (no password)", () => {
        cy.get('#enter-secret').click();
        cy.get('#secret-input').type(LOW_FUND_SEED);
        cy.get('#secret-next').click();
        cy.get('#secret-next').click();
        reload();
        cy.get('#login-wrapper');
        cy.get('#account-unlock-button').click();
        cy.get('#dashboard-wrapper');
    });

    it("should login with a seed and password", () => {
        const password = 'SamplePasswordTest123!'
        cy.get('#enter-secret').click();
        cy.get('#secret-input').type(LOW_FUND_SEED);
        cy.get('#secret-next').click();
        cy.get('#password-input').type(password);
        cy.get('#secret-next').click();
        reload();
        cy.get('#login-wrapper');
        cy.get('#active-wallet-password-input').type(password);
        cy.get('#account-unlock-button').click();
        cy.get('#dashboard-wrapper');
    });

    it("should not allow an incorrect password to login", () => {
        const password = 'SamplePasswordTest123!'
        const incorrectPassword = 'SamplePasswordTest123!!'
        cy.get('#enter-secret').click();
        cy.get('#secret-input').type(LOW_FUND_SEED);
        cy.get('#secret-next').click();
        cy.get('#password-input').type(password);
        cy.get('#secret-next').click();
        reload();
        cy.get('#login-wrapper');
        cy.get('#active-wallet-password-input').type(incorrectPassword);
        cy.get('#account-unlock-button').click();
        cy.get('#login-wrapper');
    });

    it("should clear a user's encrypted secret", () => {
        const password = 'SamplePasswordTest123!'
        cy.get('#enter-secret').click();
        cy.get('#secret-input').type(LOW_FUND_SEED);
        cy.get('#secret-next').click();
        cy.get('#password-input').type(password);
        cy.get('#secret-next').click().then(() => {
            expect(localStorage.getItem('bananostand_encryptedSeed')).to.be.ok;
        })
        cy.get('#account-settings').click();
        cy.get('#clear-data-button').click().then(() => {
            expect(localStorage.getItem('bananostand_encryptedSeed')).to.not.be.ok;
        })
    });
});
