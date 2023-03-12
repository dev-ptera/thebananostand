import { AccountRobot, DashboardRobot, OverlayRobot } from '../robots';

describe('Account Actions', () => {
    const LOW_FUND_SEED =
        '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';
    const address1 =
        'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj';

    const root = 'http://localhost:4200';
    const dashboardRobot = new DashboardRobot();
    const accountRobot = new AccountRobot();
    const overlayRobot = new OverlayRobot();

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

    describe('Change Representative', () => {
        it('should close the change representative overlay (desktop)', () => {
            accountRobot.clickChangeRep();
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
