import { Injectable } from '@angular/core';
import { WalletStorageService } from '@app/services/wallet-storage.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';

@Injectable({
    providedIn: 'root',
})
/** Stores and encrypts a user's seed or mnemonic phrase. */
export class SecretService {
    /** The password used to unlock the wallet. */
    private walletPassword: string; // TODO REMOVE ME, use app store

    // Only used when a user does not provide a password.
    readonly DEFAULT_PASSWORD = 'default_password';

    constructor(
        private readonly _appStateService: AppStateService,
        private readonly _walletEventService: WalletEventsService,
        private readonly _walletStorageService: WalletStorageService
    ) {}

    /** Provided a secret phrase and password, returns the encrypted secret. */
    async storeSecret(secret: string, walletPassword: string): Promise<string> {
        let password = walletPassword;

        if (password.length === 0) {
            password = this.DEFAULT_PASSWORD;
        }
        this.walletPassword = password;

        if (secret.length === 64) {
            return await this._storeSeed(secret, password);
        }
        return await this._storeSeed(this._mnemonicToSeed(secret), password);
    }

    /** Saves a seed in localstorage, encrypting it using a user-provided password. */
    private async _storeSeed(seed: string, password: string): Promise<string> {
        // @ts-ignore
        const result = window.bananocoin.bananojs.bananoUtil.isSeedValid(seed);
        if (!result.valid) {
            throw Error('Secret is not valid');
        }

        // @ts-ignore
        const encryptedSeed: string = await window.bananocoin.passwordUtils.encryptData(seed, password);
        return encryptedSeed;
    }

    async changePassword(currentPasswordInput: string, newPasswordInput: string): Promise<void> {
        const currentUserPassword = currentPasswordInput || this.DEFAULT_PASSWORD;
        const newUserPassword = newPasswordInput || this.DEFAULT_PASSWORD;

        if (!this.matchesCurrentPassword(currentUserPassword)) {
            throw new Error('Passwords do not match');
        }

        for await (const wallet of this._appStateService.store.getValue().localStorageWallets) {
            if (wallet.encryptedSeed) {
                const encryptedSeed = wallet.encryptedSeed;
                // @ts-ignore
                const decryptedSeed = await window.bananocoin.passwordUtils.decryptData(
                    encryptedSeed,
                    currentUserPassword
                );
                // @ts-ignore
                const reencryptSeed = await window.bananocoin.passwordUtils.encryptData(decryptedSeed, newUserPassword);
                wallet.encryptedSeed = reencryptSeed;
                this._walletEventService.reencryptWalletSecret.next(wallet);
            }
        }
        this._walletEventService.lockWallet.next();
    }

    matchesCurrentPassword(currentPasswordUserInput: string): boolean {
        const userPassword = currentPasswordUserInput || this.DEFAULT_PASSWORD;
        return userPassword === this.walletPassword;
    }

    async getActiveWalletSecret(): Promise<string> {
        const activeWalletId = this._appStateService.store.getValue().activeWallet.walletId;
        const secret = await this.getSecret(activeWalletId);
        return secret;
    }

    createNewSecretWallet(): { seed: string; mnemonic: string } {
        const seedBytes = new Uint8Array(32);
        window.crypto.getRandomValues(seedBytes);
        // @ts-ignore
        const newSeed = window.bananocoinBananojs.bananoUtil.bytesToHex(seedBytes);
        // @ts-ignore
        const newMnemonic = window.bip39.entropyToMnemonic(newSeed);
        return {
            seed: newSeed,
            mnemonic: newMnemonic,
        };
    }

    async getSecret(walletId: string): Promise<string> {
        const wallet = this._walletStorageService.getWalletFromId(walletId);
        const encryptedSeed = wallet.encryptedSeed;

        // @ts-ignore
        const seed = await window.bananocoin.passwordUtils.decryptData(encryptedSeed, this.walletPassword);
        return seed;
    }

    async backupWalletSecret(walletId: string): Promise<void> {
        const seed = await this.getSecret(walletId);
        this._walletEventService.backupSeed.next({ seed, openSnackbar: true });
    }

    async backupWalletMnemonic(walletId: string): Promise<void> {
        const seed = await this.getSecret(walletId);
        // @ts-ignore
        const mnemonic = window.bip39.entropyToMnemonic(seed);
        this._walletEventService.backupMnemonic.next({ mnemonic, openSnackbar: true });
    }

    /** Using a password, attempts to decrypt localstorage secret wallet.
     *  Throws an error if the login attempt fails. */
    async unlockSecretWallet(walletPassword: string): Promise<void> {
        let password = walletPassword;

        if (password.length === 0) {
            password = this.DEFAULT_PASSWORD;
        }

        const encryptedWallets = this._appStateService.store.getValue().localStorageWallets;
        const encryptedSeed = encryptedWallets[0].encryptedSeed;
        // @ts-ignore
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password); // Error is thrown here.
        this.walletPassword = password;
    }

    /** Given a mnemonic string, converts it to a seed phrase. */
    private _mnemonicToSeed(mnemonic: string): string {
        // @ts-ignore
        return window.bip39.mnemonicToEntropy(mnemonic);
    }
}

//  convertToMnemonic(): Promise<void> {
/*

seed-> menomimc
const seed = window.bananocoinBananojs.bananoUtil.bytesToHex(seedBytes);
const mnemonic = window.bip39.entropyToMnemonic(seed);

// Mneominc-seed
const seed = window.bip39.mnemonicToEntropy(mnemonic);
     */
// }
