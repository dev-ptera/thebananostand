import { AppStateService } from '@app/services/app-state.service';
import { SecretService } from '@app/services/secret.service';
import { Injectable } from '@angular/core';
import { Banano } from 'hw-app-nano';

import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportUSB from '@ledgerhq/hw-transport-webusb';
import TransportHID from '@ledgerhq/hw-transport-webhid';
import Transport from '@ledgerhq/hw-transport';

export type BananoifiedWindow = {
    bananocoin: any;
    bananocoinBananojs: any;
    bananocoinBananojsHw: any;
    TransportWebUSB: any;
    banotils: any;
} & Window;

declare let window: BananoifiedWindow;

export interface LedgerData {
    banano: any|null;
    transport: Transport|null;
}


@Injectable({
    providedIn: 'root',
})
export class SignerService {

    DynamicTransport: any;
    supportsU2F = false;
    supportsWebHID = false;
    supportsWebUSB = false;
    supportsBluetooth = false;
    supportsUSB = false;

    ledger: LedgerData = {
        banano: null,
        transport: null,
    };

    constructor(private readonly _secretService: SecretService, private readonly _appStateService: AppStateService) {
        this.doStuff();
    }


    /** Checks if ledger is connected via USB & is unlocked, ready to use. */
    async checkLedgerOrError(): Promise<void> {
        const config = window.bananocoinBananojsHw.bananoConfig;
        window.bananocoinBananojs.setBananodeApiUrl(config.bananodeUrl);
        const TransportWebUSB = window.TransportWebUSB;
        try {
            const isSupportedFlag = await TransportWebUSB.isSupported();
            // eslint-disable-next-line no-console
            console.info('connectLedger', 'isSupportedFlag', isSupportedFlag);
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

     //   const accountData = await window.bananocoin.bananojsHw.getLedgerAccountData(accountIndex);
    //    const account = accountData.account;
       // return account;

        return await this.getLedgerAccountWeb(accountIndex);
    }



    async doStuff(): Promise<any> {
        await this.checkBrowserSupport();
        await this.detectUsbTransport();
        const appConfig = await this.ledger.banano.getAppConfiguration();
        console.log(appConfig);
        const address = await this.getLedgerAccountWeb(0);
        console.log(address);
    }

    async checkBrowserSupport() {
        await Promise.all([
            TransportHID.isSupported().then(supported => this.supportsWebHID = supported),
            TransportUSB.isSupported().then(supported => this.supportsWebUSB = supported),
        ]);
    }

    async detectUsbTransport(): Promise<void> {
        if (this.supportsWebUSB) {
            await this.loadTransport(TransportUSB);
        } else if (this.supportsWebHID) {
            await this.loadTransport(TransportHID);
        } else {
            // Legacy browsers
            await this.loadTransport(TransportU2F);
        }
    }

    async getAccountSigner(index: number): Promise<string> {
        if (this._appStateService.store.getValue().hasUnlockedSecret) {
            const seed = await this._secretService.getActiveWalletSeed();
            return await window.bananocoinBananojs.getPrivateKey(seed, index);
        }
        return await window.bananocoin.bananojsHw.getLedgerAccountSigner(index);
    }

    async getLedgerAccountWeb(accountIndex: number) {
        try {
            return await this.ledger.banano.getAddress(this.ledgerPath(accountIndex));
        } catch (err) {
            throw err;
        }
    }

    ledgerPath(accountIndex: number) {
        const walletPrefix = `44'/198'/`;
        return `${walletPrefix}${accountIndex}'`;
    }

    async getLedgerAccount(accountIndex: number) {
        return await this.getLedgerAccountWeb(accountIndex);
    }

    async loadTransport(transport: typeof TransportU2F): Promise<void> {
        return new Promise((resolve, reject) => {
            transport.create().then(trans => {
                this.ledger.transport = trans;
                const waitTimeout = 300000;
                this.ledger.transport.setExchangeTimeout(waitTimeout); // 5 minutes
                this.ledger.banano = new Banano(trans);
                resolve();
            }).catch(reject);
        });
    }
}
