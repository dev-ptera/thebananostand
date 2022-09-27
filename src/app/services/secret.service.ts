import { Injectable } from '@angular/core';
import { LocalStorageWallet, WalletStorageService } from '@app/services/wallet-storage.service';
import { WalletEventsService } from '@app/services/wallet-events.service';

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

    constructor(
        private readonly _walletStorageService: WalletStorageService,
        private readonly _walletEventService: WalletEventsService
    ) {
        this._walletEventService.walletLocked.subscribe(() => {
            this.unlockedLocalSecret = false;
            this.walletPassword = undefined;
        });
    }

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

    /** Saves a seed in localstorage, encrypting it using a user-provided password. */
    private async _storeSeed(seed: string, walletPassword: string): Promise<LocalStorageWallet> {
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
        //window.localStorage.setItem(this.localStorageSeedId, encryptedSeed);

        const numberOfWallets = this._walletStorageService.getNumberOfWallets();
        const walletId = numberOfWallets + 1;
        const newEntry: LocalStorageWallet = {
            walletId,
            name: `Wallet No. ${walletId}`,
            encryptedSeed,
            loadedIndexes: [0],
        };
        this._walletEventService.addWallet.next(newEntry);
    }

    async getSecret(id: number): Promise<string> {
        const wallet = this._walletStorageService.getWalletFromId(id);
        const encryptedSeed = wallet.encryptedSeed;

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

        const encryptedWallets = this._walletStorageService.getWallets();
        const encryptedSeed = encryptedWallets[0].encryptedSeed;
        // @ts-ignore
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password); // Error is thrown here.
        this.walletPassword = password;
        this.unlockedLocalSecret = true;
        this._walletEventService.walletUnlocked.next({ isLedger: false });
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
        if (unlocked) {
            this._walletEventService.walletUnlocked.next({ isLedger: true });
        }
    }

    hasSecret(): boolean {
        const encryptedWallets = this._walletStorageService.getWallets();
        return encryptedWallets && encryptedWallets.length > 0;
    }
}
