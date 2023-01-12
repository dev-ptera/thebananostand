describe('Dashboard Management', () => {

    const LOW_FUND_SEED = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const LOW_FUND_MNEMONIC = 'include spray pitch burst blush target shock swallow engine forum shell pattern juice village prison clock sad old bench abstract guess edit holiday casual';

    const root = 'http://localhost:4200'
    const loadInitialAccount = 'loadInitialAccount';

    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        Cypress.config('defaultCommandTimeout', 10000);
        cy.reload();
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.intercept({ method: 'POST', url: '**', times: 3 }).as(loadInitialAccount);
        cy.get('[data-cy=secret-next]').click();
        cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
    })


    it('should load transaction details for the first account', () => {
        cy.wait(`@${loadInitialAccount}`).then(() => {
            cy.intercept({ method: 'POST', url: '**/account/confirmed-transactions' }).as('confirmedTx');
            cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').click();
            cy.wait('@confirmedTx').then(() => {
                cy.get('[data-cy=account-scroll-container]').find('.transaction-row-wrapper').its('length').should('be.gte', 2);
            })
        })
    });

    describe('Add Next Account', () => {

        const loadNextAccount = 'loadNextAccount';
        const verifyNextAccountAdded = () => {
            cy.wait(`@${loadNextAccount}`).then(() => {
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 2);
            })
        }

        it('should load first two accounts on the dashboard (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-wrapper]');
                cy.intercept({ method: 'POST', url: '**' }).as(loadNextAccount);
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
                cy.get('[data-cy=add-next-account-button]').click();
                verifyNextAccountAdded();
            })
        });

        it('should load first two accounts on the dashboard (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-wrapper]');
                cy.intercept({ method: 'POST', url: '**' }).as(loadNextAccount);
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
                cy.get('[data-cy=account-actions-mobile-menu]').click();
                cy.get('[data-cy=add-next-account-button]').click();
                verifyNextAccountAdded();
            })
        });
    })

    /* https://dev.to/walmyrlimaesilv/testing-copy-to-clipboard-with-cypress-1414 */
    Cypress.Commands.add('assertValueCopiedToClipboard', value => {
        cy.window().then(win => {
            win.navigator.clipboard.readText().then(text => {
                console.log(text);
                expect(text).to.eq(value)
            })
        })
    })

    describe('Backup Secret', () => {

        it('should copy wallet seed to clipboard', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=wallet-actions-desktop-menu]').click();
                cy.get('[data-cy=copy-seed-button]').click();
                cy.assertValueCopiedToClipboard(LOW_FUND_SEED)
                cy.get('.mat-mdc-simple-snack-bar').contains('Seed Copied');
            })
        });

        it('should copy wallet mnemonic to clipboard', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=wallet-actions-desktop-menu]').click();
                cy.get('[data-cy=copy-mnemonic-button]').click();
                cy.assertValueCopiedToClipboard(LOW_FUND_MNEMONIC);
                cy.get('.mat-mdc-simple-snack-bar').contains('Mnemonic Phrase Copied');
            })
        });
    });

    describe('Refresh Balances', () => {

        const refreshPage = 'refreshPage';
        const verifyPageRefreshed = () => {
            cy.get('[data-cy=dashboard-account-list]').should('not.exist');
            cy.wait(`@${refreshPage}`).then(() => {
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
            })
        }

        const interceptRefresh = () => {
            cy.wait(250);
            cy.intercept({ method: 'POST', url: '**', times: 2 }).as(refreshPage);
        }

        it('should refresh account balances (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                interceptRefresh();
                cy.get('[data-cy=refresh-dashboard-button]').click().then(() => {
                    verifyPageRefreshed()
                });
            })
        });

        it('should refresh account balances (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                interceptRefresh();
                cy.get('[data-cy=account-actions-mobile-menu]').click();
                cy.get('[data-cy=refresh-dashboard-button]').click().then(() => {
                    verifyPageRefreshed();
                })
            })
        });
    });


    describe('Add Specific Account', () => {

        const addAccount99 = () => {
            cy.intercept({ method: 'POST', url: '**', times: 2 }).as('addAccount');
            cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
            cy.get('[data-cy=add-specific-account-input]').type('99');
            cy.get('[data-cy=add-account-overlay-button]').click();
            cy.wait('@addAccount').then(() => {
                cy.get('#app-add-index-dialog-button').should('not.exist');
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 2);
                cy.get('[data-cy=dashboard-account-list]').find('.account-number').contains('#0');
                cy.get('[data-cy=dashboard-account-list]').find('.account-number').contains('#99');
            })
        }

        it('should load account at index 99 (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=add-specific-account-button]').click().then(() => {
                    addAccount99();
                });
            })
        });

        it('should load account at index 99 (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=account-actions-mobile-menu]').click();
                cy.get('[data-cy=add-specific-account-button]').click().then(() => {
                    addAccount99();
                });
            })
        });
    });

    /*
    describe('Removing Accounts', () => {

        it('should remove account via select single (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
                cy.get('[data-cy=select-accounts-button]').click();
                cy.get('.mat-checkbox').last().click();
                cy.get('[data-cy=remove-account-dashboard-button]').click().then(() => {
                    cy.get('[data-cy=dashboard-account-list]').should('not.exist');
                })
            })
        });

        it('should add & then remove a single account (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                const loadNextAccount = 'loadNextAccount';
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
                cy.intercept({ method: 'POST', url: '**', times: 2 }).as(loadNextAccount);
                cy.get('[data-cy=add-next-account-button]').click();
                cy.wait(`@${loadNextAccount}`).then(() => {
                    cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 2);
                    cy.get('[data-cy=select-accounts-button]').click();
                    cy.get('.mat-checkbox').last().click();
                    cy.get('[data-cy=remove-account-dashboard-button]').click().then(() => {
                        cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
                    })
                })
            })
        });

        it('should add & then remove a single account (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                const dismissBottomSheetTime = 350;
                cy.get('[data-cy=account-actions-mobile-menu]').click();
                cy.get('[data-cy=select-accounts-button]').click();
                cy.wait(dismissBottomSheetTime);
                cy.get('[data-cy=dashboard-account-list]').find('.dashboard-row-wrapper').should('have.length', 1);
                cy.get('.mat-checkbox').last().click();
                cy.wait(dismissBottomSheetTime);
                cy.get('[data-cy=remove-account-dashboard-button]').click().then(() => {
                    cy.get('[data-cy=dashboard-account-list]').should('not.exist');
                })
            })
        });
    });

     */
});
