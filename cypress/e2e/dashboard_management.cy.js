describe('Dashboard Management', () => {

    const LOW_FUND_SEED = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const root = 'http://localhost:4200'
    const loadInitialAccount = 'loadInitialAccount';

    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
        cy.get('[data-cy=enter-secret]').click();
        cy.get('[data-cy=secret-input]').type(LOW_FUND_SEED);
        cy.get('[data-cy=secret-next]').click();
        cy.intercept({ method: 'POST', url: '**', times: 3 }).as(loadInitialAccount);
        cy.get('[data-cy=secret-next]').click();
    })


    it('should load transaction details for the first account', () => {
        cy.wait(`@${loadInitialAccount}`).then(() => {
            cy.intercept({ method: 'POST', url: '**/account/confirmed-transactions' }).as('confirmedTx');
            cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').click();
            cy.wait('@confirmedTx').then(() => {
                cy.get('[data-cy=account-scroll-container]').find('.blui-info-list-item').its('length').should('be.gte', 2);
            })
        })
    });

    describe('Add Next Account', () => {

        const loadNextAccount = 'loadNextAccount';
        const verifyNextAccountAdded = () => {
            cy.wait(`@${loadNextAccount}`).then(() => {
                cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 2);
            })
        }

        it('should load first two accounts on the dashboard (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-wrapper]');
                cy.intercept({ method: 'POST', url: '**' }).as(loadNextAccount);
                cy.get('[data-cy=add-single-account-desktop-button]').click();
                verifyNextAccountAdded();
            })
        });

        it('should load first two accounts on the dashboard (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-wrapper]');
                cy.intercept({ method: 'POST', url: '**' }).as(loadNextAccount);
                cy.get('[data-cy=show-dashboard-actions]').click();
                cy.get('[data-cy=add-next-account-mobile-button]').click();
                verifyNextAccountAdded();
            })
        });
    })

    describe('Refresh Balances', () => {

        const refreshPage = 'refreshPage';
        const verifyPageRefreshed = () => {
            cy.get('[data-cy=dashboard-account-list]').should('not.exist');
            cy.wait(`@${refreshPage}`).then(() => {
                cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 1);
            })
        }

        const interceptRefresh = () => {
            cy.wait(250);
            cy.intercept({ method: 'POST', url: '**', times: 2 }).as(refreshPage);
        }

        it('should refresh account balances (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                interceptRefresh();
                cy.get('[data-cy=advanced-toggle]').click();
                cy.get('[data-cy=refresh-dashboard-desktop-button]').click().then(() => {
                    verifyPageRefreshed()
                });
            })
        });

        it.only('should refresh account balances (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                interceptRefresh();
                cy.get('[data-cy=show-dashboard-actions]').click();
                cy.get('[data-cy=refresh-dashboard-mobile-button]').click().then(() => {
                    verifyPageRefreshed();
                })
            })
        });
    });


    describe('Add Specific Account', () => {

        const addAccount99 = () => {
            cy.intercept({ method: 'POST', url: '**', times: 2 }).as('addAccount');
            cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 1);
            cy.get('[data-cy=add-specific-account-input]').type('99');
            cy.get('[data-cy=add-account-overlay-button]').click();
            cy.wait('@addAccount').then(() => {
                cy.get('#app-add-index-dialog-button').should('not.exist');
                cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 2);
                cy.get('[data-cy=dashboard-account-list]').find('.blui-list-item-tag-label').contains('Account #0');
                cy.get('[data-cy=dashboard-account-list]').find('.blui-list-item-tag-label').contains('Account #99');
            })
        }

        it('should load account at index 99 (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=advanced-toggle]').click();
                cy.get('[data-cy=add-specific-account-desktop-button]').click().then(() => {
                    addAccount99();
                });
            })
        });

        it('should load account at index 99 (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=show-dashboard-actions]').click();
                cy.get('[data-cy=add-specific-account-mobile-button]').click().then(() => {
                    addAccount99();
                });
            })
        });
    });

    describe('Removing Accounts', () => {

        it('should remove account via select all (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 1);
                cy.get('[data-cy=advanced-toggle]').click();
                cy.get('.mat-checkbox').first().click();
                cy.get('[data-cy=remove-account-dashboard-desktop-button]').click().then(() => {
                    cy.get('[data-cy=dashboard-account-list]').should('not.exist');
                })
            })
        });

        it('should remove account via select single (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 1);
                cy.get('[data-cy=advanced-toggle]').click();
                cy.get('.mat-checkbox').last().click();
                cy.get('[data-cy=remove-account-dashboard-desktop-button]').click().then(() => {
                    cy.get('[data-cy=dashboard-account-list]').should('not.exist');
                })
            })
        });

        it('should remove a single account (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                const loadNextAccount = 'loadNextAccount';
                cy.intercept({ method: 'POST', url: '**', times: 2 }).as(loadNextAccount);
                cy.get('[data-cy=add-single-account-desktop-button]').click();
                cy.wait(`@${loadNextAccount}`).then(() => {
                    cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 2);
                    cy.get('[data-cy=advanced-toggle]').click();
                    cy.get('.mat-checkbox').last().click();
                    cy.get('[data-cy=remove-account-dashboard-desktop-button]').click().then(() => {
                        cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 1);
                    })
                })
            })
        });

        it('should remove a single account (mobile)', () => {
            cy.viewport('iphone-6');
            cy.wait(`@${loadInitialAccount}`).then(() => {
                const dismissBottomSheetTime = 350;
                cy.get('[data-cy=show-dashboard-actions]').click();
                cy.get('[data-cy=select-accounts-mobile-button]').click();
                cy.wait(dismissBottomSheetTime);
                cy.get('[data-cy=dashboard-account-list]').find('.blui-info-list-item').should('have.length', 1);
                cy.get('.mat-checkbox').last().click();
                cy.get('[data-cy=show-dashboard-actions]').click();
                cy.wait(dismissBottomSheetTime);
                cy.get('[data-cy=remove-account-mobile-button]').click().then(() => {
                    cy.get('[data-cy=dashboard-account-list]').should('not.exist');
                })
            })
        });
    });
});
