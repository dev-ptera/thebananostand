import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service';
import { SpyglassService } from './spyglass.service';
import { UtilService } from './util.service';
import { RpcService } from '@app/services/rpc.service';
import { WalletStorageService } from '@app/services/wallet-storage.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';
import { AccountOverview } from '@app/types/AccountOverview';

@Injectable({
    providedIn: 'root',
})

/** This is the service used by Dashboard and Account pages to manage a user's session and display state info. */
export class AccountService {
    constructor(
        private readonly _util: UtilService,
        private readonly _rpcService: RpcService,
        private readonly _spyglassApi: SpyglassService,
        private readonly _appStateService: AppStateService,
        private readonly _transactionService: TransactionService,
        private readonly _walletEventService: WalletEventsService,
        private readonly _walletStorageService: WalletStorageService
    ) {
        this._walletEventService.removeIndex.subscribe((index: number) => {
            this.removeAccount(index);
        });
    }

    isRepOnline(address: string): boolean {
        if (!address) {
            return true;
        }
        if (this._appStateService.onlineRepresentatives.size === 0) {
            return true;
        }
        return this._appStateService.onlineRepresentatives.has(address);
    }

    findNextUnloadedIndex(): number {
        let currIndex = 0;
        this._appStateService.store.getValue().accounts.map((account) => {
            if (this._util.matches(account.index, currIndex)) {
                currIndex++;
            }
        });
        return currIndex;
    }

    /** Opens a hash in an explorer. */
    showBlockInExplorer(hash: string): void {
        const explorerBlockPage = 'https://www.yellowspyglass.com/hash';
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
        return await this._rpcService.getAccountInfo(index);
    }

    /** Call this function to remove a specified index from the list of accounts. */
    removeAccount(removedIndex: number): void {
        this._appStateService.store.getValue().accounts = this._appStateService.store
            .getValue()
            .accounts.filter((account) => !this._util.matches(account.index, removedIndex));
        this.updateTotalBalance();
    }

    /** Iterates through each loaded account and aggregates the total confirmed balance. */
    updateTotalBalance(): void {
        let balance = 0;
        this._appStateService.store.getValue().accounts.map((account) => {
            balance += account.balance;
        });
        this._appStateService.store.getValue().totalBalance = this._util.numberWithCommas(balance, 6);
    }
}
