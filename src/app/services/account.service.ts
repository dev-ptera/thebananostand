import { Injectable } from '@angular/core';
import { SpyglassService } from './spyglass.service';
import { RpcService } from '@app/services/rpc.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { AccountOverview } from '@app/types/AccountOverview';

@Injectable({
    providedIn: 'root',
})

/** This is the service used by Dashboard and Account pages to manage a user's session and display state info. */
export class AccountService {
    store: AppStore;

    constructor(
        private readonly _rpcService: RpcService,
        private readonly _spyglassApi: SpyglassService,
        private readonly _appStateService: AppStateService
    ) {
        this._appStateService.store.subscribe((store) => {
            this.store = store;
        });
    }

    /** Returns whether a representative is online. */
    isRepOnline(address: string): boolean {
        const onlineReps = this._appStateService.onlineRepresentatives;
        return !address || onlineReps.size === 0 || onlineReps.has(address);
    }

    /** Finds the next sequential account that hasn't been added to the dashboard. */
    findNextUnloadedIndex(): number {
        let currIndex = 0;
        this.store.accounts.forEach((account) => {
            if (account.index === currIndex) {
                currIndex++;
            }
        });
        return currIndex;
    }

    /** Opens a hash in an explorer. */
    showBlockInExplorer(hash: string): void {
        const explorerBlockPage = 'https://creeper.banano.cc/hash';
        window.open(`${explorerBlockPage}/${hash}`);
    }

    /** Given an address, returns a monKey API URL. */
    createMonKeyUrl(address: string): string {
        return `https://monkey.banano.cc/api/v1/monkey/${address}?svc=bananostand`;
    }

    /** Returns a set of online representatives. */
    async fetchOnlineRepresentatives(): Promise<Set<string>> {
        const reps = await this._spyglassApi.getOnlineReps();
        return new Set(reps);
    }

    /** Fetches the list of known accounts from Creeper. */
    async fetchKnownAccounts(): Promise<Map<string, string>> {
        const accounts = await this._spyglassApi.getAllKnownAccounts();
        const map = new Map<string, string>();
        accounts.forEach((acc) => map.set(acc.address, acc.alias));
        return map;
    }

    /** Fetches RPC account_info and stores response in a list sorted by account number. */
    async fetchAccount(index: number): Promise<AccountOverview> {
        const MAX_PENDING = 100;
        if (isNaN(index)) {
            return undefined;
        }
        try {
            const account = await this._rpcService.getAccountInfoFromIndex(index);
            const pending = await this._spyglassApi.getReceivableTransactions(
                account.fullAddress,
                MAX_PENDING,
                this.store.minimumBananoThreshold
            );
            account.pending = pending;
            return account;
        } catch (err) {
            return undefined;
        }
    }

    /** Call this function to remove specified indexes from the list of accounts. */
    removeAccounts(indexes: number[]): AccountOverview[] {
        const removeSet = new Set(indexes);
        return this.store.accounts.filter((account) => !removeSet.has(account.index));
    }

    /** Given a list of accounts, aggregates the total balance. */
    calculateLoadedAccountsTotalBalance(accounts: AccountOverview[]): number {
        let total = 0;
        accounts.forEach((acc) => {
            total += acc.balance;
        });
        return total;
    }
}
