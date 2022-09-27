import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service';
import { SpyglassService } from './spyglass.service';
import { UtilService } from './util.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { RpcService } from '@app/services/rpc.service';
import { LocalStorageWallet, WalletStorageService } from '@app/services/wallet-storage.service';
import { WalletEventsService } from '@app/services/wallet-events.service';

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

    isLedger: boolean;

    constructor(
        private readonly _spyglassApi: SpyglassService,
        private readonly _util: UtilService,
        private readonly _rpcService: RpcService,
        private readonly _transactionService: TransactionService,
        private readonly _walletEventService: WalletEventsService,
        private readonly _walletStorageService: WalletStorageService
    ) {
        this._walletEventService.activeWalletChange.subscribe((wallet: LocalStorageWallet) => {
            this.accounts = [];
            if (wallet) {
                void this.populateAccountsViaIndex(wallet.loadedIndexes);
            }
        });

        this._walletEventService.walletUnlocked.subscribe((data) => {
            this.isLedger = data.isLedger;
            this._refreshBalances();
            this.fetchOnlineRepresentatives();
            this.fetchRepresentativeAliases();
            this.fetchKnownAccounts();
        });

        this._walletEventService.removeIndex.subscribe((index: number) => {
            this.removeAccount(index);
        });

        this._walletEventService.addIndex.subscribe((index) => {
            this._walletEventService.accountLoading.next(true);
            this.fetchAccount(index)
                .then(() => {
                    this._walletEventService.accountLoading.next(false);
                })
                .catch((err) => {
                    console.error(err);
                });
        });

        this._walletEventService.refreshIndexes.subscribe(() => {
            this._refreshBalances();
        });
    }

    private _refreshBalances(): void {
        this.accounts = [];
        const indexesToLoad = this._walletStorageService.getLoadedIndexes();
        if (!indexesToLoad || indexesToLoad.length === 0) {
            this._walletEventService.addIndex.next(0);
        } else {
            void this.populateAccountsViaIndex(indexesToLoad);
        }
    }

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
                this._updateTotalBalance();
                return Promise.resolve();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /** Call this function to remove a specified index from the list of accounts. */
    removeAccount(removedIndex: number): void {
        this.accounts = this.accounts.filter((account) => !this._util.matches(account.index, removedIndex));
        this._updateTotalBalance();
    }

    findNextUnloadedIndex(): number {
        let currIndex = 0;
        this.accounts.map((account) => {
            if (this._util.matches(account.index, currIndex)) {
                currIndex++;
            }
        });
        return currIndex;
    }

    /** Reading local storage, fetches account information for each managed account.
     *  If there are no accounts found in local storage, fetches account #0.  */
    async populateAccountsViaIndex(indexes: number[]): Promise<void> {
        this.accounts = [];
        indexes.sort((a, b) => a - b);
        this._walletEventService.accountLoading.next(true);
        for await (const index of indexes) {
            await this.fetchAccount(Number(index));
        }
        this._walletEventService.accountLoading.next(false);
    }

    /** Iterates through each loaded account and aggregates the total confirmed balance. */
    private _updateTotalBalance(): void {
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

    /** Given an address, returns a monKey API URL. */
    createMonKeyUrl(address: string): string {
        return `https://monkey.banano.cc/api/v1/monkey/${address}?svc=bananostand`;
    }
}
