import { Injectable } from '@angular/core';
import { AppStateService } from '@app/services/app-state.service';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';

export type BananoifiedWindow = {
    bananocoin: any;
    bananocoinBananojs: any;
    bip39: any;
} & Window;

declare let window: BananoifiedWindow;

@Injectable({
    providedIn: 'root',
})
/** Stores and encrypts a user's seed or mnemonic phrase. */
export class SecretService {
    // Only used when a user does not provide a password.
    readonly DEFAULT_PASSWORD = 'default_password';

    constructor(private readonly _appStateService: AppStateService) {}

    /** Provided a secret phrase and password, returns the encrypted secret. */
    async storeSecret(secret: string, walletPassword: string): Promise<string> {
        const password = walletPassword || this.DEFAULT_PASSWORD;
        if (secret.length === 64) {
            return await this._storeSeed(secret, password);
        }
        return await this._storeSeed(this._mnemonicToSeed(secret), password);
    }

    /** Saves a seed in localstorage, encrypting it using a user-provided password. */
    private async _storeSeed(seed: string, password: string): Promise<string> {
        const result = window.bananocoin.bananojs.bananoUtil.isSeedValid(seed);
        if (!result.valid) {
            throw Error('Secret is not valid');
        }
        const encryptedSeed: string = await window.bananocoin.passwordUtils.encryptData(seed, password);
        return encryptedSeed;
    }

    async changePassword(currentPasswordInput: string, newPasswordInput: string): Promise<LocalStorageWallet[]> {
        const currentUserPassword = currentPasswordInput || this.DEFAULT_PASSWORD;
        const newUserPassword = newPasswordInput || this.DEFAULT_PASSWORD;

        if (!this.matchesCurrentPassword(currentUserPassword)) {
            throw new Error('Current password incorrect');
        }
        const wallets = this._appStateService.store.getValue().localStorageWallets;
        for await (const wallet of wallets) {
            if (wallet.encryptedSeed) {
                let encryptedSeed = wallet.encryptedSeed;
                const decryptedSeed = await window.bananocoin.passwordUtils.decryptData(
                    encryptedSeed,
                    currentUserPassword
                );
                encryptedSeed = await window.bananocoin.passwordUtils.encryptData(decryptedSeed, newUserPassword);
                wallet.encryptedSeed = encryptedSeed;
            }
        }
        return wallets;
    }

    matchesCurrentPassword(currentPasswordUserInput: string): boolean {
        const userProvidedPassword = currentPasswordUserInput || this.DEFAULT_PASSWORD;
        const currentPassword = this._appStateService.store.getValue().walletPassword || this.DEFAULT_PASSWORD;
        return userProvidedPassword === currentPassword;
    }

    createNewSecretWallet(): { seed: string; mnemonic: string } {
        const seedBytes = new Uint8Array(32);
        window.crypto.getRandomValues(seedBytes);
        const newSeed = window.bananocoinBananojs.bananoUtil.bytesToHex(seedBytes);
        const newMnemonic = window.bip39.entropyToMnemonic(newSeed);
        return {
            seed: newSeed,
            mnemonic: newMnemonic,
        };
    }

    async getActiveWalletSeed(): Promise<string> {
        const store = this._appStateService.store.getValue();
        const password = store.walletPassword || this.DEFAULT_PASSWORD;
        const encryptedSeed = store.activeWallet.encryptedSeed;
        const seed = await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password);
        return seed;
    }

    async getActiveWalletMnemonic(): Promise<string> {
        const seed = await this.getActiveWalletSeed();
        return window.bip39.entropyToMnemonic(seed);
    }

    /** Using a password, attempts to decrypt localstorage secret wallet.
     *  Throws an error if the login attempt fails. */
    async unlockSecretWallet(walletPassword: string): Promise<void> {
        const password = walletPassword || this.DEFAULT_PASSWORD;
        const encryptedWallets = this._appStateService.store.getValue().localStorageWallets;
        const encryptedSeed = encryptedWallets[0].encryptedSeed;
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password); // Error is thrown here.
    }

    /** Given a mnemonic string, converts it to a seed phrase. */
    private _mnemonicToSeed(mnemonic: string): string {
        return window.bip39.mnemonicToEntropy(mnemonic);
    }
}
