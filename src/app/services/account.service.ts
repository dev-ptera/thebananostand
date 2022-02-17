import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service';
import { SpyglassService } from './spyglass.service';
import { UtilService } from './util.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { RpcService } from '@app/services/rpc.service';

@Injectable({
    providedIn: 'root',
})

/** This is the service used by Dashboard and Account pages to manage a user's session and display state info. */
export class AccountService {
    /** Loaded ledger accounts, their rep, & respective balances.  */
    accounts: AccountOverview[] = [];

    /** Set of online representatives. */
    onlineRepresentatives: Set<string> = new Set();

    /** Map of address to alias, specific to reps. */
    repAliases: Map<string, string> = new Map<string, string>();

    /** Map of address to alias, contains all known aliases. */
    knownAccounts: Map<string, string> = new Map<string, string>();

    /** Aggregate balance of all loaded accounts. */
    totalBalance: string;

    localStorageAccountIndexesKey = 'HW_WALLET_POC_ACCOUNT_INDEXES';
    localStorageAdvancedViewKey = 'HW_WALLET_POC_ADVANCED_VIEW';

    constructor(
        private readonly _spyglassApi: SpyglassService,
        private readonly _util: UtilService,
        private readonly _rpcService: RpcService,
        private readonly _transactionService: TransactionService
    ) {}

    fetchOnlineRepresentatives(): void {
        this._spyglassApi
            .getOnlineReps()
            .then((reps) => {
                this.onlineRepresentatives = new Set(reps);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    fetchRepresentativeAliases(): void {
        this._spyglassApi
            .getRepresentativeAliases()
            .then((pairs) => {
                pairs.map((pair) => {
                    this.repAliases.set(pair.address, pair.alias);
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    fetchKnownAccounts(): void {
        this._spyglassApi
            .getAllKnownAccounts()
            .then((pairs) => {
                pairs.map((pair) => {
                    this.knownAccounts.set(pair.address, pair.alias);
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    isRepOnline(address: string): boolean {
        if (!address) {
            return true;
        }
        if (this.onlineRepresentatives.size === 0) {
            return true;
        }
        return this.onlineRepresentatives.has(address);
    }

    /** Fetches RPC account_info and stores response in a list sorted by account number. */
    fetchAccount(index: number): Promise<void> {
        this.removeAccount(index);
        return this._rpcService
            .getAccountInfo(index)
            .then((overview) => {
                this.accounts.push(overview);
                this.accounts.sort((a, b) => (a.index > b.index ? 1 : -1));
                this.saveAccountsInLocalStorage();
                this.updateTotalBalance();
                return Promise.resolve();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /** Call this function to remove a specified index from the list of accounts. */
    removeAccount(index: number): void {
        const nonPrunedAccounts = [];
        this.accounts.map((account) => {
            if (account.index !== index) {
                nonPrunedAccounts.push(account);
            }
        });
        this.accounts = nonPrunedAccounts;
    }

    findNextUnloadedIndex(): number {
        let currIndex = 0;
        this.accounts.map((account) => {
            if (account.index === currIndex) {
                currIndex++;
            }
        });
        return currIndex;
    }

    saveAccountsInLocalStorage(): void {
        const loadedIndexes = [];
        this.accounts.map((account) => {
            loadedIndexes.push(account.index);
        });
        loadedIndexes.sort((a, b) => a - b);
        window.localStorage.setItem(this.localStorageAccountIndexesKey, loadedIndexes.toString());
    }

    saveAdvancedViewInLocalStorage(isAdvancedView: boolean): void {
        window.localStorage.setItem(this.localStorageAdvancedViewKey, String(isAdvancedView));
    }

    isAdvancedView(): boolean {
        return window.localStorage.getItem(this.localStorageAdvancedViewKey) === 'true';
    }

    /** Reading local storage, fetches account information for each managed account.
     *  If there are no accounts found in local storage, fetches account #0.  */
    async populateAccountsFromLocalStorage(): Promise<void> {
        const indexesString = window.localStorage.getItem(this.localStorageAccountIndexesKey);
        if (!indexesString) {
            return this.fetchAccount(0);
        }
        const indexes = indexesString.split(',');
        for await (const index of indexes) {
            await this.fetchAccount(Number(index));
        }
    }

    /** Iterates through each loaded account and aggregates the total confirmed balance. */
    updateTotalBalance(): void {
        let balance = 0;
        this.accounts.map((account) => {
            balance += account.balance;
        });
        this.totalBalance = this._util.numberWithCommas(balance, 6);
    }

    /** Opens a hash in an explorer. */
    showBlockInExplorer(hash: string): void {
        const explorerBlockPage = 'https://www.yellowspyglass.com/hash';
        window.open(`${explorerBlockPage}/${hash}`);
    }
}
