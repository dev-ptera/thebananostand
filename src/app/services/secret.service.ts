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

        this._walletEventService.addSecret.subscribe((data: { secret: string, password: string }) => {
            void this._storeSecret(data.secret, data.password);
        });
    }

    private async _storeSecret(secret: string, walletPassword: string): Promise<void> {
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
        const walletId = encryptedSeed.substring(0, 10);
        const newEntry: LocalStorageWallet = {
            walletId,
            name: `Wallet No. ${walletId}`,
            encryptedSeed,
            loadedIndexes: [0],
        };
        this._walletEventService.addWallet.next(newEntry);
    }

    async changePassword(currentPasswordInput: string, newPasswordInput: string): Promise<void> {
        const currentUserPassword = currentPasswordInput || this.DEFAULT_PASSWORD;
        const newUserPassword = newPasswordInput || this.DEFAULT_PASSWORD;

        if (!this.matchesCurrentPassword(currentUserPassword)) {
            throw new Error('Passwords do not match');
        }

        for await (const wallet of this._walletStorageService.readWalletsFromLocalStorage()) {
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
        this._walletEventService.walletLocked.next();
    }

    matchesCurrentPassword(currentPasswordUserInput: string): boolean {
        const userPassword = currentPasswordUserInput || this.DEFAULT_PASSWORD;
        return userPassword === this.walletPassword;
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

    createNewWallet(): { seed: string; mnemonic: string } {
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

    // Throws an error if the login attempt fails.
    async unlockSecretWallet(walletPassword: string): Promise<void> {
        let password = walletPassword;

        if (password.length === 0) {
            password = this.DEFAULT_PASSWORD;
        }

        const encryptedWallets = this._walletStorageService.readWalletsFromLocalStorage();
        console.log(encryptedWallets);
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
        const encryptedWallets = this._walletStorageService.readWalletsFromLocalStorage();
        return encryptedWallets && encryptedWallets.length > 0;
    }
}
