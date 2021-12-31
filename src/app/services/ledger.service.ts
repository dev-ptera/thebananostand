// @ts-nocheck
import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { AccountOverview } from '@app/types/AccountOverview';

@Injectable({
    providedIn: 'root',
})
// This will be home to functions that interact with ledger.
export class LedgerService {
    constructor(private readonly _util: UtilService) {}

    /** Attempts a withdraw.  On success, returns transaction hash. */
    async withdraw(recipient: string, withdrawAmount: number, accountIndex: number): Promise<string> {
        const accountSigner = await window.bananocoin.bananojsHw.getLedgerAccountSigner(accountIndex);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
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

    /** Attempts a change block.  On success, returns transaction hash. */
    async changeRepresentative(newRep: string, address: string, accountIndex: number): Promise<string> {
        const accountSigner = await window.bananocoin.bananojsHw.getLedgerAccountSigner(accountIndex);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
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
            await this.getLedgerAccount(0);
            return Promise.resolve();
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Given an index, reads ledger device & returns an address. */
    async getLedgerAccount(accountIndex: number): Promise<string> {
        const accountData = await window.bananocoin.bananojsHw.getLedgerAccountData(accountIndex);
        console.log('connectLedger', 'accountData', accountData);
        const account = accountData.account;
        return account;
    }

    async receive(account: string, index: number, hash: string): Promise<string> {
        const config = window.bananocoinBananojsHw.bananoConfig;
        const accountSigner = await window.bananocoin.bananojsHw.getLedgerAccountSigner(index);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        let representative = await bananodeApi.getAccountRepresentative(account);
        if (!representative) {
            representative = account;
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

    async getPending(account: string): Promsie<string[]> {
        console.log('banano checkpending accountData', account);
        const MAX_PENDING = 10;
        const pendingResponse = await window.bananocoinBananojs.getAccountsPending([account], MAX_PENDING, true);
        console.log('banano checkpending pendingResponse', pendingResponse);
        const pendingBlocks = pendingResponse.blocks[account];
        const hashes = [...Object.keys(pendingBlocks)];
        return hashes;
    }

    async getAccountInfo(index: number): Promise<AccountOverview> {
        const account = await this.getLedgerAccount(index);
        const accountInfo = await window.bananocoinBananojs.getAccountInfo(account, true);
        const pending = await this.getPending(account);

        if (accountInfo.error) {
            console.log(accountInfo.error);
            if (accountInfo.error === 'Account not found') {
                return {
                    index,
                    shortAddress: this._util.shortenAddress(account),
                    fullAddress: account,
                    formattedBalance: 0,
                    balance: 0,
                    representative: undefined,
                    pending: []
                };
            } else {
                return Promise.reject(accountInfo.error);
            }
        }

        const balanceParts = await window.bananocoinBananojs.getBananoPartsFromRaw(accountInfo.balance);
        if (balanceParts.raw === '0') {
            delete balanceParts.raw;
        }
        const bananoDecimal: number = await window.bananocoinBananojs.getBananoPartsAsDecimal(balanceParts);

        return {
            index,
            shortAddress: this._util.shortenAddress(account),
            fullAddress: account,
            formattedBalance: this._util.numberWithCommas(bananoDecimal, 6),
            balance: Number(bananoDecimal),
            representative: accountInfo.representative,
            pending
        };
    }
}
