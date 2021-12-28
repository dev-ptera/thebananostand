import { Injectable } from '@angular/core';
import { AccountOverview, BananoService } from './banano.service';
import { ApiService } from './api.service';
import { UtilService } from './util.service';

@Injectable({
    providedIn: 'root',
})
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
    constructor(
        private readonly _api: ApiService,
        private readonly _util: UtilService,
        private readonly _bananoService: BananoService
    ) {}

    fetchOnlineRepresentatives(): void {
        this._api
            .getOnlineReps()
            .then((reps) => {
                this.onlineRepresentatives = new Set(reps);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    fetchRepresentativeAliases(): void {
        this._api
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
        this._api
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

    fetchAccount(index: number): Promise<void> {
        return this._bananoService
            .getAccountInfo(index)
            .then((overview) => {
                this.accounts.push(overview);
                this.saveAccountsInLocalStorage();
                this._updateTotalBalance();
                return Promise.resolve();
            })
            .catch((err) => {
                console.error(err);
            });
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
        window.localStorage.setItem(this.localStorageAccountIndexesKey, loadedIndexes.toString());
    }

    async populateAccountsFromLocalStorage(): Promise<void> {
        const indexesString = window.localStorage.getItem(this.localStorageAccountIndexesKey);
        if (!indexesString) {
            return this.fetchAccount(0);
        }
        const indexes = indexesString.split(',');
        console.log(indexes);
        for await (const index of indexes) {
            await this.fetchAccount(Number(index));
        }
    }

    private _updateTotalBalance(): void {
        let balance = 0;
        this.accounts.map((account) => {
            balance += account.balance;
        });
        this.totalBalance = this._util.numberWithCommas(balance, 6);
    }
}
