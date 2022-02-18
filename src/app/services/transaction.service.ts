// @ts-nocheck
import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { environment } from '../../environments/environment';
import { NanoClientService } from '@app/services/nano-client.service';
import { SeedService } from '@app/services/seed.service';

@Injectable({
    providedIn: 'root',
})
/** Services that handle send, receive, change transactions. */
export class TransactionService {
    constructor(
        private readonly _util: UtilService,
        private readonly _seedService: SeedService,
        private readonly _nanoClientService: NanoClientService
    ) {}

    private _configApi(api): void {
        api.setUrl(this._nanoClientService.getRpcNode().nodeAddress);
        api.setAuth(environment.token);
    }

    /** Attempts a withdraw.  On success, returns transaction hash. */
    async withdraw(recipient: string, withdrawAmount: number, accountIndex: number): Promise<string> {
        const accountSigner = await this.getAccountSigner(accountIndex);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        this._configApi(bananodeApi);
        const bananoUtil = window.bananocoinBananojs.bananoUtil;
        const config = window.bananocoinBananojsHw.bananoConfig;
        try {
            const amountRaw = window.bananocoinBananojs.getBananoDecimalAmountAsRaw(withdrawAmount);
            const response = await bananoUtil.sendFromPrivateKey(
                bananodeApi,
                accountSigner,
                recipient,
                amountRaw,
                config.prefix
            );
            console.log('withdraw', 'response', response);
            return Promise.resolve(response);
        } catch (error) {
            console.log('withdraw', 'error', error);
            return Promise.reject(error);
        }
    }

    /** Attempts to receive funds. */
    async receive(account: string, index: number, hash: string): Promise<string> {
        const config = window.bananocoinBananojsHw.bananoConfig;
        const accountSigner = await this.getAccountSigner(index);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        this._configApi(bananodeApi);
        let representative = await bananodeApi.getAccountRepresentative(account);
        if (!representative) {
            representative = 'ban_3batmanuenphd7osrez9c45b3uqw9d9u81ne8xa6m43e1py56y9p48ap69zg'; // TODO populate this via the rep scores API. For now default to batman
        }
        console.log('banano checkpending config', config);
        const loggingUtil = window.bananocoinBananojs.loggingUtil;
        const depositUtil = window.bananocoinBananojs.depositUtil;
        const receiveResponse = await depositUtil.receive(
            loggingUtil,
            bananodeApi,
            account,
            accountSigner,
            representative,
            hash,
            config.prefix
        );
        return receiveResponse;
    }

    /** Attempts a change block.  On success, returns transaction hash. */
    async changeRepresentative(newRep: string, address: string, accountIndex: number): Promise<string> {
        const accountSigner = await this.getAccountSigner(accountIndex);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        this._configApi(bananodeApi);
        const bananoUtil = window.bananocoinBananojs.bananoUtil;
        const config = window.bananocoinBananojsHw.bananoConfig;
        try {
            const response = await bananoUtil.change(bananodeApi, accountSigner, newRep, config.prefix);
            console.log('change', 'response', response);
            return Promise.resolve(response);
        } catch (error) {
            console.log('change', 'error', error);
            return Promise.reject(error);
        }
    }

    async checkLedgerOrError(): Promise<void> {
        const config = window.bananocoinBananojsHw.bananoConfig;
        window.bananocoinBananojs.setBananodeApiUrl(config.bananodeUrl);
        const TransportWebUSB = window.TransportWebUSB;
        try {
            const isSupportedFlag = await TransportWebUSB.isSupported();
            console.log('connectLedger', 'isSupportedFlag', isSupportedFlag);
            // Check Ledger is connected & app is open:
            await this.getAccountFromIndex(0);
            return Promise.resolve();
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Given an index, reads ledger device & returns an address. */
    async getAccountFromIndex(accountIndex: number): Promise<string> {
        if (this.isUsingSecret()) {
            const seed = await this._seedService.getSeed();
            const privateKey = await window.bananocoinBananojs.getPrivateKey(seed, accountIndex);
            const publicKey = await window.bananocoinBananojs.getPublicKey(privateKey);
            const account = window.bananocoinBananojs.getBananoAccount(publicKey);
            return account;
        }
        const accountData = await window.bananocoin.bananojsHw.getLedgerAccountData(accountIndex);
        console.log('connectLedger', 'accountData', accountData);
        const account = accountData.account;
        return account;
    }

    isUsingSecret(): boolean {
        return this._seedService.isUnlocked();
    }

    async getAccountSigner(index: number): any {
        if (this.isUsingSecret()) {
            const seed = await this._seedService.getSeed();
            console.log('getAccountSigner', 'seed', seed);
            return await window.bananocoinBananojs.getPrivateKey(seed, index);
        } else {
            return await window.bananocoin.bananojsHw.getLedgerAccountSigner(index);
        }
    }
}
