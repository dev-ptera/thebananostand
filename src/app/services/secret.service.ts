import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/** Stores and encrypts a user's seed or mnemonic phrase. */
export class SecretService {
    private unlockedLocalSecret = false;
    private unlockedLocalLedger = false;

    // Only used when a user does not provide a password.
    readonly DEFAULT_PASSWORD = 'default_password';

    /** The password used to unlock the wallet. */
    private walletPassword: string;
    private readonly localStorageSeedId = 'bananostand_encryptedSeed';

    async storeSecret(secret: string, walletPassword: string): Promise<void> {
        let password = walletPassword;

        if (password.length === 0) {
            password = this.DEFAULT_PASSWORD;
        }

        if (secret.length === 64) {
            await this._storeSeed(secret, password);
        } else {
            // @ts-ignore
            const seed = window.bip39.mnemonicToEntropy(secret);
            await this._storeSeed(seed, password);
        }
        this.walletPassword = password;
        this.unlockedLocalSecret = true;
    }

    private async _storeSeed(seed: string, walletPassword: string): Promise<void> {
        let password = walletPassword;

        if (password.length === 0) {
            password = this.DEFAULT_PASSWORD;
        }

        // @ts-ignore
        const result = window.bananocoin.bananojs.bananoUtil.isSeedValid(seed);
        if (!result.valid) {
            return Promise.reject('Secret is not valid');
        }
        // @ts-ignore
        const encryptedSeed = await window.bananocoin.passwordUtils.encryptData(seed, password);
        window.localStorage.setItem(this.localStorageSeedId, encryptedSeed);
    }

    async getSecret(): Promise<string> {
        const encryptedSeed = window.localStorage.getItem(this.localStorageSeedId);
        // @ts-ignore
        const seed = await window.bananocoin.passwordUtils.decryptData(encryptedSeed, this.walletPassword);
        return seed;
    }

    // Throws an error if the login attempt fails.
    async unlockSecretWallet(walletPassword: string): Promise<void> {
        let password = walletPassword;

        if (password.length === 0) {
            password = this.DEFAULT_PASSWORD;
        }

        const encryptedSeed = window.localStorage.getItem(this.localStorageSeedId);
        // @ts-ignore
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password);
        this.walletPassword = password;
        this.unlockedLocalSecret = true;
    }

    isLocalSecretUnlocked(): boolean {
        return this.unlockedLocalSecret;
        /** LocalMobile **/
        // return true;
    }

    isLocalLedgerUnlocked(): boolean {
        return this.unlockedLocalLedger;
    }

    setLocalLedgerUnlocked(unlocked: boolean): void {
        this.unlockedLocalLedger = unlocked;
    }

    hasSecret(): boolean {
        const secret = window.localStorage.getItem(this.localStorageSeedId);
        return Boolean(secret);
    }

    clearSeed(): void {
        window.localStorage.removeItem(this.localStorageSeedId);
        this.walletPassword = undefined;
        this.unlockedLocalSecret = false;
    }
}
