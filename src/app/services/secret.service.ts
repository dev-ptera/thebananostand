import { Injectable } from '@angular/core';
import { AppStateService } from '@app/services/app-state.service';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';

export type BananoifiedWindow = {
    bananocoin: any;
    bananocoinBananojs: any;
    bip39: any;
} & Window;

declare let window: BananoifiedWindow;

// Only used when a user does not provide a password.
const DEFAULT_PASSWORD = 'default_password';

@Injectable({
    providedIn: 'root',
})
/** Stores and encrypts a user's seed or mnemonic phrase. */
export class SecretService {
    constructor(private readonly _appStateService: AppStateService) {}

    /** Provided a secret phrase and password, returns the encrypted secret. */
    async storeSecret(
        secret: string,
        userPassword: string
    ): Promise<{ walletPassword: string; encryptedSecret: string }> {
        const walletPassword = userPassword || DEFAULT_PASSWORD;
        const encryptedSecret =
            secret.length === 64
                ? await this._encryptSeedUsingPassword(secret, walletPassword)
                : await this._encryptSeedUsingPassword(this._mnemonicToSeed(secret), walletPassword);
        return { walletPassword, encryptedSecret };
    }

    /** Encrypts seed using a password. */
    private async _encryptSeedUsingPassword(seed: string, password: string): Promise<string> {
        const result = window.bananocoin.bananojs.bananoUtil.isSeedValid(seed);
        if (!result.valid) {
            throw Error('Secret is not valid');
        }
        return await window.bananocoin.passwordUtils.encryptData(seed, password);
    }

    async changePassword(
        userProvidedCurrentPassword: string,
        userProvidedNewPassword: string
    ): Promise<{ localStorageWallets: LocalStorageWallet[]; walletPassword: string }> {
        const currentUserPassword = userProvidedCurrentPassword || DEFAULT_PASSWORD;
        const newUserPassword = userProvidedNewPassword || DEFAULT_PASSWORD;

        try {
            await this.unlockSecretWallet(currentUserPassword);
        } catch {
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
        return { localStorageWallets: wallets, walletPassword: newUserPassword };
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
        const password = store.walletPassword || DEFAULT_PASSWORD;
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
        const password = walletPassword || DEFAULT_PASSWORD;
        const encryptedWallets = this._appStateService.store.getValue().localStorageWallets;
        const encryptedSeed = encryptedWallets[0].encryptedSeed;
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password); // Error is thrown here.
    }

    /** Given a mnemonic string, converts it to a seed phrase. */
    private _mnemonicToSeed(mnemonic: string): string {
        return window.bip39.mnemonicToEntropy(mnemonic);
    }
}
