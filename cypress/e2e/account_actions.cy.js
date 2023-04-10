import {
    AccountRobot,
    DashboardRobot,
    GlobalRobot,
    OverlayRobot,
} from '../robots';

describe('Account Actions', () => {
    const LOW_FUND_SEED =
        '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const address1 =
        'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj';

    const root = 'http://localhost:4200';
    const dashboardRobot = new DashboardRobot();
    const accountRobot = new AccountRobot();
    const overlayRobot = new OverlayRobot();
    const globalRobot = new GlobalRobot();

    beforeEach(() => {
        Cypress.config('defaultCommandTimeout', 90000);
        cy.setDashboardCardView();
        cy.reload();
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home'); // once the route resolves, cy.wait will resolve as well
        cy.importAccount(LOW_FUND_SEED);
        dashboardRobot.checkDashboardExists().clickAccountNumber(0);
        accountRobot.checkAccountPageExists().checkTransactionsLoaded();
    });

    describe.only('Filtering', () => {
        it('should open filter overlay (desktop)', () => {
            accountRobot.clickFilterButtonDesktop();
            overlayRobot.checkFilterOverlayExists();
        });
        it('should open filter overlay (mobile)', () => {
            cy.viewport('iphone-6');
            accountRobot.clickAccountActions().clickFilterButtonMobile();
            overlayRobot.checkFilterOverlayExists();
        });
        it('should close the filter overlay', () => {
            accountRobot.clickFilterButtonDesktop();
            overlayRobot
                .checkFilterOverlayExists()
                .clickCloseFilterButton()
                .checkFilterOverlayNotExists();
        });
        const confirmTxReq = {
            method: 'POST',
            url: '**/confirmed-transactions',
        };
        const checkType = (req, type) => {
            req.on('response', (res) => {
                for (const tx of res.body) {
                    expect(tx.type).to.equal(type);
                }
            });
        };
        it('should filter to only show change transactions', () => {
            cy.intercept(confirmTxReq, (req) => checkType(req, 'change')).as(
                'filter'
            );
            accountRobot.clickFilterButtonDesktop();
            overlayRobot
                .clickReceivedFilterChip()
                .clickSentFilterChip()
                .clickApplyFilter();
            cy.wait('@filter');
            accountRobot.checkTransactionsLoaded();
        });
        it('should filter to only show received transactions', () => {
            cy.intercept(confirmTxReq, (req) => checkType(req, 'receive')).as(
                'filter'
            );
            accountRobot.clickFilterButtonDesktop();
            overlayRobot
                .clickChangeFilterChip()
                .clickSentFilterChip()
                .clickApplyFilter();
            cy.wait('@filter');
            accountRobot.checkTransactionsLoaded();
        });
        it('should filter to only show sent transactions', () => {
            cy.intercept(confirmTxReq, (req) => checkType(req, 'send')).as(
                'filter'
            );
            accountRobot.clickFilterButtonDesktop();
            overlayRobot
                .clickChangeFilterChip()
                .clickReceivedFilterChip()
                .clickApplyFilter();
            cy.wait('@filter');
            accountRobot.checkTransactionsLoaded();
        });
    });

    describe('Refresh', () => {
        it('should refresh account history (desktop)', () => {
            cy.intercept({
                method: 'POST',
                url: '**/confirmed-transactions',
            }).as('refresh');
            accountRobot.clickRefreshAccountDesktop();
            accountRobot
                .checkLoadingIndicatorExists()
                .checkNoTransactionsLoaded();
            cy.wait('@refresh');
            accountRobot
                .checkTransactionsLoaded()
                .checkLoadingIndicatorNotExists();
        });
        it('should refresh account history (mobile)', () => {
            cy.viewport('iphone-6');
            cy.intercept({
                method: 'POST',
                url: '**/confirmed-transactions',
            }).as('refresh');
            accountRobot.clickAccountActions().clickRefreshAccountMobile();
            accountRobot
                .checkLoadingIndicatorExists()
                .checkNoTransactionsLoaded();
            cy.wait('@refresh');
            accountRobot
                .checkTransactionsLoaded()
                .checkLoadingIndicatorNotExists();
        });
    });

    describe('Copy Address', () => {
        it('should copy account address to clipboard (desktop)', () => {
            accountRobot.clickCopyAddressDesktop();
            cy.assertValueCopiedToClipboard(address1);
        });

        it('should copy account address to clipboard (mobile)', () => {
            cy.viewport('iphone-6');
            accountRobot.clickAccountActions().clickCopyAddressMobile();
            cy.assertValueCopiedToClipboard(address1);
            const addressCopiedText = 'Address Copied';
            globalRobot.checkSnackbarTextContains(addressCopiedText);
        });
    });

    describe('Change Representative', () => {
        it('should close the change representative overlay (desktop)', () => {
            accountRobot.clickChangeRep();
            overlayRobot
                .checkChangeRepOverlayExists()
                .clickCloseChangeRepOverlay()
                .checkChangeRepOverlayNotExists();
        });

        it('should close the change representative overlay (mobile)', () => {
            cy.viewport('iphone-6');
            accountRobot.clickAccountActions().clickChangeRepMobile();
            overlayRobot
                .checkChangeRepOverlayExists()
                .clickCloseChangeRepOverlay()
                .checkChangeRepOverlayNotExists();
        });
    });

    describe('Send', () => {
        it('should close the send overlay (desktop)', () => {
            accountRobot.clickSend();
            overlayRobot
                .checkSendOverlayExists()
                .clickCloseSend()
                .checkSendOverlayNotExists();
        });

        it('should close the send overlay (mobile)', () => {
            cy.viewport('iphone-6');
            accountRobot.clickSend();
            overlayRobot
                .checkSendOverlayExists()
                .clickCloseSend()
                .checkSendOverlayNotExists();
        });

        it('should send .01 BAN to self (desktop)', () => {
            accountRobot.clickSend();
            overlayRobot
                .checkSendOverlayExists()
                .clickSendNextButton()
                .enterSendAmount('.01')
                .clickSendNextButton()
                .enterRecipientAddress(address1)
                .clickSendNextButton()
                .clickSendNextButton() // Sends actual transaction
                .checkSendLoading()
                .checkSendSuccess();
        });
    });

    describe('Receive', () => {
        /** The receive button will be disabled unless we have something to actually receive. */
        it('should close the receive overlay (desktop)', () => {
            accountRobot.clickReceive();
            overlayRobot
                .checkReceiveOverlayExists()
                .clickCloseReceive()
                .checkReceiveOverlayNotExists();
        });

        it('should close the receive overlay (mobile)', () => {
            cy.viewport('iphone-6');
            accountRobot.clickReceive();
            overlayRobot
                .checkReceiveOverlayExists()
                .clickCloseReceive()
                .checkReceiveOverlayNotExists();
        });

        it('should receive all incoming transaction(s) (desktop)', () => {
            accountRobot.clickReceive();
            overlayRobot
                .checkReceiveOverlayExists()
                .clickReceiveNextButton()
                .checkReceiveLoading()
                .checkReceiveSuccess();
        });
    });
});
