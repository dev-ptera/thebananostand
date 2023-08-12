import { LoginRobot, OverlayRobot } from '../robots';

describe('API Transaction Overlay', () => {
    const LOW_FUND_SEED =
        '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';

    const root = 'http://localhost:4200';
    const loginRobot = new LoginRobot();
    const overlayRobot = new OverlayRobot();
    const password = 'UniquePasswordForTestingSpec';

    beforeEach(() => {
        Cypress.config('defaultCommandTimeout', 10000);
        cy.reload();
        cy.setDashboardCardView();
        importSeed();
    });

    const importSeed = () => {
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home');
        cy.importAccount(LOW_FUND_SEED, password);
    };

    it('should show the correct send information, populated from query parameters', () => {
        cy.visit(
            `${root}?request=send&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj&amount=.006`
        );
        loginRobot.enterPassword(password).clickUnlockButton();
        overlayRobot
            .checkApiRequestOverlayExists()
            .checkApiRequestSendAmountEquals('.006')
            .checkApiRequestActionAddressEquals(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            )
            .clickApiRequestNextButton()
            .selectApiRequestAccount()
            .clickApiRequestNextButton()
            .checkApiRequestSendAmountEquals('.006')
            .checkApiRequestActionAddressEquals(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            );
    });

    it('should close the api transaction overlay', () => {
        cy.visit(
            `${root}?request=send&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj&amount=.006`
        );
        loginRobot.enterPassword(password).clickUnlockButton();
        overlayRobot
            .checkApiRequestOverlayExists()
            .clickApiRequestNextButton()
            .selectApiRequestAccount()
            .clickApiRequestNextButton()
            // From confirmation screen
            .clickApiRequestBackButton()
            .checkApiRequestOverlayExists()
            .clickApiRequestBackButton()
            .checkApiRequestOverlayExists()
            .clickApiRequestBackButton()
            .checkApiRequestOverlayNotExists();
    });
});
