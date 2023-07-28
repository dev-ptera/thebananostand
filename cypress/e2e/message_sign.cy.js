import {
    ChangePasswordRobot,
    DashboardRobot,
    GlobalRobot,
    HomeRobot,
    LoginRobot,
    SigningRobot,
    SettingsRobot,
} from '../robots';

describe('Message Sign', () => {
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
    const signingRobot = new SigningRobot();
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

    it('should go sign message using custom message', () => {
        cy.visit(
            `${root}/signing?request=message_sign&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj`
        );
        loginRobot.enterPassword(password).clickUnlockButton();
        cy.url().should(
            'equal',
            `${root}/signing?request=message_sign&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj`
        );
        signingRobot
            .checkSigningPageExists()
            .clickMessageSigningExpand()
            .checkMessageSignButtonDisabled()
            .enterMessage('samplemessage')
            .clickMessageSignButton()
            .checkSignatureEquals(
                '5311920B2B136AA23EF4E7C6266EA570D8546AD331D029B95BCBF58907A8F1B54E1223681EFBFC22B7667150B8EEC478FBADD6B92F44DD61D5593520A7477C05'
            )
            .clickMessageVerificationExpand()
            .enterVerificationAddress(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            )
            .enterVerificationMessage('samplemessage')
            .enterVerificationSignature(
                '5311920B2B136AA23EF4E7C6266EA570D8546AD331D029B95BCBF58907A8F1B54E1223681EFBFC22B7667150B8EEC478FBADD6B92F44DD61D5593520A7477C05'
            )
            .checkSignatureValid();
    });

    it('should handle invalid signatures', () => {
        cy.visit(
            `${root}/signing?request=message_sign&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj`
        );
        loginRobot.enterPassword(password).clickUnlockButton();
        cy.url().should(
            'equal',
            `${root}/signing?request=message_sign&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj`
        );
        signingRobot
            .checkSigningPageExists()
            .clickMessageSigningExpand()
            .checkMessageSignButtonDisabled()
            .enterMessage('samplemessage')
            .clickMessageSignButton()
            .checkSignatureEquals(
                '5311920B2B136AA23EF4E7C6266EA570D8546AD331D029B95BCBF58907A8F1B54E1223681EFBFC22B7667150B8EEC478FBADD6B92F44DD61D5593520A7477C05'
            )
            .clickMessageVerificationExpand()
            .enterVerificationAddress(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            )
            .enterVerificationMessage('samplemessage')
            .enterVerificationSignature(
                '6311920B2B136AA23EF4E7C6266EA570D8546AD331D029B95BCBF58907A8F1B54E1223681EFBFC22B7667150B8EEC478FBADD6B92F44DD61D5593520A7477C05'
            )
            .checkSignatureInvalid();
    });

    it('should go the signing page with a message param', () => {
        cy.visit(
            `${root}/signing?request=message_sign&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj&message=cheese`
        );
        loginRobot.enterPassword(password).clickUnlockButton();
        cy.url().should(
            'equal',
            `${root}/signing?request=message_sign&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj&message=cheese`
        );
        signingRobot
            .checkSigningPageExists()
            .clickMessageSigningExpand()
            .clickMessageSignButton()
            .checkSignatureEquals(
                '532DE131A1498AAF6F037DB128F2CB0D6C07FC55EEA461DDEA6FBBF3A4F6AA3220896967A6349E3D63592254EEEB59619C5DB9F76ACF4E0F81D12D1680004C00'
            )
            .clickMessageVerificationExpand()
            .enterVerificationAddress(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            )
            .enterVerificationMessage('cheese')
            .enterVerificationSignature(
                '532DE131A1498AAF6F037DB128F2CB0D6C07FC55EEA461DDEA6FBBF3A4F6AA3220896967A6349E3D63592254EEEB59619C5DB9F76ACF4E0F81D12D1680004C00'
            )
            .checkSignatureValid();
    });
});
