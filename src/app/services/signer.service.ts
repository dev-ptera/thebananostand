/* eslint-disable */
import { AppStateService } from '@app/services/app-state.service';
import { SecretService } from '@app/services/secret.service';
import { Injectable } from '@angular/core';
import { BROWSER_SUPPORTS_USB } from '@app/services/wallet-events.service';

export type BananoifiedWindow = {
    bananocoin: any;
    bananocoinBananojs: any;
    bananocoinBananojsHw: any;
    TransportWebUSB: any;
    banotils: any;
} & Window;

declare let window: BananoifiedWindow;

@Injectable({
    providedIn: 'root',
})
export class SignerService {
    constructor(private readonly _secretService: SecretService, private readonly _appStateService: AppStateService) {
        void this._checkUsbSupport();
    }

    private async _checkUsbSupport(): Promise<void> {
        console.log('_checkUsbSupport()');
        await window.bananocoin.bananojsHw.onUsbReady(() => {
            console.log('onUsbReady');
            BROWSER_SUPPORTS_USB.next();
            console.log('BROWSER_SUPPORTS_USB.next();');
        });
    }

    /** Checks if ledger is connected via USB & is unlocked, ready to use. */
    async checkLedgerOrError(): Promise<void> {
        try {
            // Check Ledger is connected & app is open:
            await this.getAccountFromIndex(0);
            return Promise.resolve();
        } catch (err) {
            console.error(err);
            if (err.message) {
                if (err.message.includes('No device selected')) {
                    return Promise.reject('No ledger device connected.');
                }
            }

            return Promise.reject('Error connecting ledger.');
        }
    }

    /** Returns a public address associated with the active wallet's index number. */
    async getAccountFromIndex(accountIndex: number): Promise<string> {
        if (this._appStateService.store.getValue().hasUnlockedSecret) {
            const seed = await this._secretService.getActiveWalletSeed();
            const privateKey = await window.bananocoinBananojs.getPrivateKey(seed, accountIndex);
            const publicKey = await window.bananocoinBananojs.getPublicKey(privateKey);
            const account = window.bananocoinBananojs.getBananoAccount(publicKey);
            return account;
        }

        try {
            const address = await window.bananocoin.bananojsHw.getLedgerAddressFromIndex(accountIndex);
            return address;
        } catch(error) {
            throw error;
        }
    }

    async getAccountSigner(index: number): Promise<string> {
        if (this._appStateService.store.getValue().hasUnlockedSecret) {
            const seed = await this._secretService.getActiveWalletSeed();
            return await window.bananocoinBananojs.getPrivateKey(seed, index);
        }

        return await window.bananocoin.bananojsHw.getLedgerAccountSigner(index);
    }
}
