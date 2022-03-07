import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/** Stores and encrypts a user's seed or mnemonic phrase. */
export class SecretService {
    unlockedLocalSecret = false;
    unlockedLocalLedger = false;

    /** The password used to unlock the wallet. */
    private walletPassword: string;
    private readonly localStorageSeedId = 'bananostand_encryptedSeed';

    async storeSecret(secret: string, walletPassword: string): Promise<void> {
        this.walletPassword = walletPassword;
        this.unlockedLocalSecret = true;
        if (secret.length === 64) {
            await this.storeSeed(secret, walletPassword);
        } else {
            // @ts-ignore
            const seed = window.bip39.mnemonicToEntropy(secret);
            await this.storeSeed(seed, walletPassword);
        }
    }

    private async storeSeed(seed: string, password: string): Promise<void> {
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
    async unlockWallet(password: string): Promise<void> {
        const encryptedSeed = window.localStorage.getItem(this.localStorageSeedId);
        // @ts-ignore
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password);
        this.walletPassword = password;
        this.unlockedLocalSecret = true;
    }

    isLocalSecretUnlocked(): boolean {
        return this.unlockedLocalSecret;
    }

    isLocalLedgerUnlocked(): boolean {
        return this.unlockedLocalLedger;
    }

    hasSecret(): boolean {
        const secret = window.localStorage.getItem(this.localStorageSeedId);
        return Boolean(secret);
    }

    clearSeed(): void {
        window.localStorage.removeItem(this.localStorageSeedId);
        this.walletPassword = undefined;
    }
}
