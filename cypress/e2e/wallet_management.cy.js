describe("Wallet Management", () => {

    const address1 = 'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj';
    const LOW_FUND_SEED = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const root = 'http://localhost:4200'

    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
    })

    it("should load first two accounts on the dashboard", () => {
        cy.get('#enter-secret').click();
        cy.get('#secret-input').type(LOW_FUND_SEED);
        cy.get('#secret-next').click();
        cy.intercept({ method: 'POST', url: '**' }).as('loadingAccount1');
        cy.get('#secret-next').click();
        cy.wait('@loadingAccount1').then(() => {
            cy.get('#dashboard-wrapper');
            cy.intercept({ method: 'POST', url: '**' }).as('loadingAccount2');
            cy.get('#add-single-account-button').click();
            cy.wait('@loadingAccount2').then(() => {
                cy.get('#dashboard-account-list').find('.blui-info-list-item').should('have.length', 2);

            })
        })
    });

    it("should load transaction details for the first account", () => {
        cy.get('#enter-secret').click();
        cy.get('#secret-input').type(LOW_FUND_SEED);
        cy.get('#secret-next').click();
        cy.intercept({ method: 'POST', url: '**' }).as('loadingAccount1');
        cy.get('#secret-next').click();
        cy.wait('@loadingAccount1').then(() => {
            cy.intercept({ method: 'POST', url: '**/account/confirmed-transactions' }).as('confirmedTx');
            cy.get('#dashboard-account-list').find('.blui-info-list-item').click();
            cy.wait('@confirmedTx').then(() => {
                cy.get('#account-scroll-container').find('.blui-info-list-item').its('length').should('be.gte', 10);
            })
        })
    });


});
