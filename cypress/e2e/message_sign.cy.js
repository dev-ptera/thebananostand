import { LoginRobot, SigningRobot } from '../robots';

describe('Message Sign', () => {
    const LOW_FUND_SEED =
        '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31';

    const root = 'http://localhost:4200';
    const loginRobot = new LoginRobot();
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
                '686484C637A14AF6324BE721B8AB2B9AA93D8D2CBC4FACC91EC1BA80C70B38309A6B597F566375BEA04BB87303AA173E241B14CC23875C983121045FB0B00A06'
            )
            .clickMessageVerificationExpand()
            .enterVerificationAddress(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            )
            .enterVerificationMessage('samplemessage')
            .enterVerificationSignature(
                '686484C637A14AF6324BE721B8AB2B9AA93D8D2CBC4FACC91EC1BA80C70B38309A6B597F566375BEA04BB87303AA173E241B14CC23875C983121045FB0B00A06'
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
                '686484C637A14AF6324BE721B8AB2B9AA93D8D2CBC4FACC91EC1BA80C70B38309A6B597F566375BEA04BB87303AA173E241B14CC23875C983121045FB0B00A06'
            )
            .clickMessageVerificationExpand()
            .enterVerificationAddress(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            )
            .enterVerificationMessage('samplemessage')
            .enterVerificationSignature(
                '786484C637A14AF6324BE721B8AB2B9AA93D8D2CBC4FACC91EC1BA80C70B38309A6B597F566375BEA04BB87303AA173E241B14CC23875C983121045FB0B00A06'
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
                'C4E6ADE8957E39D4BC18CC703A848B9F0251B406D47EA1A7B5A045AAFBF185AC25438EF21E4FDF55A7E724D3C5A3011D28D27F751545B9AED93F3291156B7F03'
            )
            .clickMessageVerificationExpand()
            .enterVerificationAddress(
                'ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj'
            )
            .enterVerificationMessage('cheese')
            .enterVerificationSignature(
                'C4E6ADE8957E39D4BC18CC703A848B9F0251B406D47EA1A7B5A045AAFBF185AC25438EF21E4FDF55A7E724D3C5A3011D28D27F751545B9AED93F3291156B7F03'
            )
            .checkSignatureValid();
    });
});
