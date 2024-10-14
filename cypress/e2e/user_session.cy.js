import {
    ChangePasswordRobot,
    DashboardRobot,
    GlobalRobot,
    HomeRobot,
    LoginRobot,
    SettingsRobot,
} from '../robots';

describe('User Session', () => {
    const LOW_FUND_SEED =
        '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';

    const root = 'http://localhost:4200';
    const testPassword = 'SamplePasswordTest123';
    const homeRobot = new HomeRobot();
    const loginRobot = new LoginRobot();
    const dashboardRobot = new DashboardRobot();
    const settingsRobot = new SettingsRobot();
    const globalRobot = new GlobalRobot();
    const changePasswordRobot = new ChangePasswordRobot();

    beforeEach(() => {
        Cypress.config('defaultCommandTimeout', 10000);
        cy.reload();
        cy.setDashboardCardView();
        reload();
    });

    const reload = () => {
        cy.intercept(root).as('home');
        cy.visit(root);
        cy.wait('@home');
    };

    it('should log a user out on page refresh', () => {
        cy.importAccount(LOW_FUND_SEED);
        reload();
        loginRobot.checkLoginPageExists();
        dashboardRobot.checkDashboardNotExists();
    });

    it('should import a wallet with a seed and password, refresh and then login', () => {
        const password = 'UniquePasswordForTestingSpec';
        cy.importAccount(LOW_FUND_SEED, password);
        dashboardRobot.countLoadedAccounts(1);
        reload();
        loginRobot
            .checkLoginPageExists()
            .enterPassword(password)
            .clickUnlockButton()
            .checkLoginPagNotExists();
        dashboardRobot.checkDashboardExists().countLoadedAccounts(1);
    });

    it('should not allow an incorrect password to login', () => {
        const incorrectPassword = 'SamplePasswordTest123!!';
        cy.importAccount(LOW_FUND_SEED, testPassword);
        reload();
        loginRobot
            .checkLoginPageExists()
            .enterPassword(incorrectPassword)
            .clickUnlockButton()
            .checkLoginPageExists();

        dashboardRobot.checkDashboardNotExists();
    });

    it("should clear a user's encrypted secret after removing a wallet", () => {
        cy.importAccount(LOW_FUND_SEED);
        globalRobot.checkWalletLocalStorageExists();
        cy.removeWallet();
        globalRobot.checkWalletLocalStorageNotExists();
    });

    it('should navigate user back to home screen & display snackbar when secret is cleared', () => {
        cy.importAccount(LOW_FUND_SEED);
        cy.removeWallet();
        cy.window().then(() => {
            dashboardRobot.checkDashboardNotExists();
            globalRobot.checkSnackbarTextContains('Removed Wallet');
        });
    });

    it('should log a user out after changing password', () => {
        cy.importAccount(LOW_FUND_SEED, testPassword);

        settingsRobot
            .clickSettings()
            .clickAdvancedSettingsMenuOption()
            .clickChangePassword();

        const newPassword = 'ABD123XYZ';
        changePasswordRobot
            .checkOverlayExists()
            .enterCurrentPassword(testPassword)
            .enterNewPassword(newPassword)
            .confirmNewPassword(newPassword)
            .clickChangePassword()
            .checkOverlayNotExists();

        dashboardRobot.checkDashboardNotExists();
        loginRobot.checkLoginPageExists();
    });

    it('should, after changing password, require new password to view accounts ', () => {
        cy.importAccount(LOW_FUND_SEED, testPassword);

        const newPassword = 'ABD123XYZ';
        const incorrectPassword = 'ABC123XYZ';
        settingsRobot
            .clickSettings()
            .clickAdvancedSettingsMenuOption()
            .clickChangePassword();

        changePasswordRobot
            .checkOverlayExists()
            .enterCurrentPassword(testPassword)
            .enterNewPassword(newPassword)
            .confirmNewPassword(newPassword)
            .clickChangePassword()
            .checkOverlayNotExists();

        // Log In
        loginRobot
            .enterPassword(incorrectPassword)
            .clickUnlockButton()
            .checkLoginPageExists()
            .clearPassword()
            .enterPassword(newPassword)
            .clickUnlockButton();

        // Confirm account loads
        dashboardRobot.checkDashboardExists().countLoadedAccounts(1);
    });

    it('should log a user out after clearing local storage', () => {
        cy.importAccount(LOW_FUND_SEED);

        settingsRobot
            .clickSettings()
            .clickAdvancedSettingsMenuOption()
            .clearLocalStorage();

        globalRobot
            .checkWalletLocalStorageNotExists()
            .checkSnackbarTextContains('All Wallets Removed');

        dashboardRobot.checkDashboardNotExists();
        loginRobot.checkLoginPagNotExists();
        homeRobot.checkHomePageExists();
    });
});
