describe('Account Actions', () => {

    const address1 = 'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj';
    const address2 = 'ban_1g98o6q1sidjbgo7gnqkobz1byo6tufjtt34n7prm6mbhcw914a9bgtkp584';
    const LOW_FUND_SEED = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const root = 'http://localhost:4200'
    const loadInitialAccount = 'loadInitialAccount';

    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.reload();
        Cypress.config('defaultCommandTimeout', 90000);
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.intercept({method: 'POST', url: '**', times: 3}).as(loadInitialAccount);
        cy.get('[data-cy=secret-next]').click();
        cy.intercept({ method: 'POST', url: '**/account/confirmed-transactions' }).as('confirmedTx');
        cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').click();
        cy.wait('@confirmedTx').then(() => {
            cy.get('[data-cy=account-scroll-container]').find('.blui-info-list-item').its('length').should('be.gte', 2);
        })
    })

    describe('Change Representative', () => {
        it('should close the change representative overlay (desktop)', () => {
            cy.get('[data-cy=change-action]').click();
            cy.get('.change-rep-overlay');
            cy.get('[data-cy=change-close-button]').click();
            cy.get('.change-rep-overlay').should('not.exist');
        });
    })

    describe('Send', () => {

        it('should close the send overlay (desktop)', () => {
            cy.get('[data-cy=send-action]').click();
            cy.get('.send-overlay');
            cy.get('[data-cy=send-close-button]').click();
            cy.get('.send-overlay').should('not.exist');
        });

        it('should send .01 BAN to self (desktop)', () => {
            cy.get('[data-cy=send-action]').click();
            cy.get('.send-overlay');
            cy.get('[data-cy=send-next-button]').click();
            cy.get('[data-cy=send-amount-input]').type('.01');
            cy.get('[data-cy=send-next-button]').click();
            cy.get('[data-cy=send-recipient-input]').type(address1);
            cy.get('[data-cy=send-next-button]').click();
            cy.get('[data-cy=send-next-button]').click();
            cy.get('[data-cy=send-loading]').should('exist');
            cy.get('[data-cy=send-success-state]').should('exist');
        });
    })

    describe('Receive', () => {

        it('should close the receive overlay (desktop)', () => {
            cy.get('[data-cy=receive-action]').click();
            cy.get('.receive-overlay');
            cy.get('[data-cy=receive-close-button]').click();
            cy.get('.receive-overlay').should('not.exist');
        });

        it('should receive all incoming transaction(s) (desktop)', () => {
            cy.get('[data-cy=receive-action]').click();
            cy.get('.receive-overlay');
            cy.get('[data-cy=receive-button]').click();
            cy.get('[data-cy=receive-loading]').should('exist');
            cy.get('[data-cy=receive-success-state').should('exist');
        });
    });
});
