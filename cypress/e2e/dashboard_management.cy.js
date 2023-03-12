import {
    AccountRobot,
    DashboardRobot,
    GlobalRobot,
    OverlayRobot,
} from '../robots';

describe('Dashboard Management', () => {
    const LOW_FUND_SEED =
        '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const LOW_FUND_MNEMONIC =
        'include spray pitch burst blush target shock swallow engine forum shell pattern juice village prison clock sad old bench abstract guess edit holiday casual';

    const root = 'http://localhost:4200';
    const dashboardRobot = new DashboardRobot();
    const accountRobot = new AccountRobot();
    const globalRobot = new GlobalRobot();
    const overlayRobot = new OverlayRobot();

    beforeEach(() => {
        Cypress.config('defaultCommandTimeout', 10000);
        cy.reload();
        cy.setDashboardCardView();
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
        cy.importAccount(LOW_FUND_SEED);
        dashboardRobot.checkDashboardExists().countLoadedAccounts(1);
    });

    it('should load transaction details for the first account', () => {
        dashboardRobot.clickAccountNumber(0);
        accountRobot.checkAccountPageExists().checkTransactionsLoaded();
    });

    describe('Add Next Account', () => {
        it('should load first two accounts on the dashboard (desktop)', () => {
            dashboardRobot.clickAddNextAccountDesktop().countLoadedAccounts(2);
        });
        it('should load first two accounts on the dashboard (mobile)', () => {
            cy.viewport('iphone-6');
            dashboardRobot.clickAddNextAccountMobile().countLoadedAccounts(2);
        });
    });

    describe('Backup Secret', () => {
        it('should copy wallet seed to clipboard', () => {
            dashboardRobot.clickWalletActions().clickCopySeed();
            cy.assertValueCopiedToClipboard(LOW_FUND_SEED);
            globalRobot.checkSnackbarTextContains('Seed Copied');
        });

        it('should copy wallet mnemonic to clipboard', () => {
            dashboardRobot.clickWalletActions().clickCopyMnemonic();
            cy.assertValueCopiedToClipboard(LOW_FUND_MNEMONIC);
            globalRobot.checkSnackbarTextContains('Mnemonic Phrase Copied');
        });
    });

    describe('Refresh Balances', () => {
        it('should refresh account balances (desktop)', () => {
            dashboardRobot
                .clickRefreshDesktop()
                .countLoadedAccounts(0)
                .countLoadedAccounts(1);
        });

        it('should refresh account balances (mobile)', () => {
            cy.viewport('iphone-6');
            dashboardRobot
                .clickRefreshMobile()
                .countLoadedAccounts(0)
                .countLoadedAccounts(1);
        });
    });

    describe('Add Specific Account', () => {
        const addAccount99 = () => {
            overlayRobot
                .checkAddAccountOverlayExists()
                .enterAddAccountNumber(99)
                .clickAddAccountButton()
                .checkAddAccountOverlayNotExists();
            dashboardRobot
                .countLoadedAccounts(2)
                .checkSpecificAccountNumberExists(0)
                .checkSpecificAccountNumberExists(99);
        };

        it('should load account at index 99 (desktop)', () => {
            dashboardRobot.clickAddSpecificAccountDesktop();
            addAccount99();
        });

        it('should load account at index 99 (mobile)', () => {
            cy.viewport('iphone-6');
            dashboardRobot.clickAddSpecificAccountMobile();
            addAccount99();
        });
    });

    /*
    describe('Removing Accounts', () => {

        it('should remove account via select single (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                cy.get('[data-cy=dashboard-account-cards-container]').find('[data-cy=dashboard-account-card-footer]').should('have.length', 1);
                cy.get('[data-cy=select-accounts-button]').click();
                cy.get('.mat-checkbox').last().click();
                cy.get('[data-cy=remove-account-dashboard-button]').click().then(() => {
                    cy.get('[data-cy=dashboard-account-cards-container]').should('not.exist');
                })
            })
        });

        it('should add & then remove a single account (desktop)', () => {
            cy.wait(`@${loadInitialAccount}`).then(() => {
                const loadNextAccount = 'loadNextAccount';
                cy.get('[data-cy=dashboard-account-cards-container]').find('[data-cy=dashboard-account-card-footer]').should('have.length', 1);
                cy.intercept({ method: 'POST', url: '**', times: 2 }).as(loadNextAccount);
                cy.get('[data-cy=add-next-account-button]').click();
                cy.wait(`@${loadNextAccount}`).then(() => {
                    cy.get('[data-cy=dashboard-account-cards-container]').find('[data-cy=dashboard-account-card-footer]').should('have.length', 2);
                    cy.get('[data-cy=select-accounts-button]').click();
                    cy.get('.mat-checkbox').last().click();
                    cy.get('[data-cy=remove-account-dashboard-button]').click().then(() => {
                        cy.get('[data-cy=dashboard-account-cards-container]').find('[data-cy=dashboard-account-card-footer]').should('have.length', 1);
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
                cy.get('[data-cy=dashboard-account-cards-container]').find('[data-cy=dashboard-account-card-footer]').should('have.length', 1);
                cy.get('.mat-checkbox').last().click();
                cy.wait(dismissBottomSheetTime);
                cy.get('[data-cy=remove-account-dashboard-button]').click().then(() => {
                    cy.get('[data-cy=dashboard-account-cards-container]').should('not.exist');
                })
            })
        });
    });

     */
});
