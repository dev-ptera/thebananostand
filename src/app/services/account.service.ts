import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service';
import { SpyglassService } from './spyglass.service';
import { UtilService } from './util.service';
import { RpcService } from '@app/services/rpc.service';
import { LocalStorageWallet, WalletStorageService } from '@app/services/wallet-storage.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';

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
        this._walletEventService.activeWalletChange.subscribe((wallet: LocalStorageWallet) => {
            void this.refreshDashboardUsingIndexes(wallet.loadedIndexes);
        });

        this._walletEventService.removeIndex.subscribe((index: number) => {
            this.removeAccount(index);
        });

        this._walletEventService.refreshIndexes.subscribe(() => {
            this.refreshBalances();
        });

        this._walletEventService.addIndexes.subscribe((indexes: number[]) => {
            void (async (): Promise<void> => {
                this._walletEventService.accountLoading.next(true);
                for await (const index of indexes) {
                    await this._addIndex(index);
                }
                this._walletEventService.accountLoading.next(false);
            })();
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

    /** Fetches RPC account_info and stores response in a list sorted by account number. */
    fetchAccount(index: number): Promise<void> {
        this.removeAccount(index);
        return this._rpcService
            .getAccountInfo(index)
            .then((overview) => {
                this._appStateService.accounts.push(overview);
                this._appStateService.accounts.sort((a, b) => (a.index > b.index ? 1 : -1));
                this.updateTotalBalance();
                return Promise.resolve();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    findNextUnloadedIndex(): number {
        let currIndex = 0;
        this._appStateService.accounts.map((account) => {
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

    fetchOnlineRepresentatives(): void {
        this._spyglassApi
            .getOnlineReps()
            .then((reps) => {
                this._appStateService.onlineRepresentatives = new Set(reps);
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
                    this._appStateService.repAliases.set(pair.address, pair.alias);
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
                    this._appStateService.knownAccounts.set(pair.address, pair.alias);
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /** Call this function to remove a specified index from the list of accounts. */
    removeAccount(removedIndex: number): void {
        this._appStateService.accounts = this._appStateService.accounts.filter(
            (account) => !this._util.matches(account.index, removedIndex)
        );
        this.updateTotalBalance();
    }

    /** Synchronously loads account balances. */
    async refreshDashboardUsingIndexes(indexes: number[]): Promise<void> {
        this._appStateService.accounts = [];
        indexes.sort((a, b) => a - b);
        this._walletEventService.accountLoading.next(true);
        for await (const index of indexes) {
            await this.fetchAccount(Number(index));
        }
        this._walletEventService.accountLoading.next(false);
    }

    /** Iterates through each loaded account and aggregates the total confirmed balance. */
    updateTotalBalance(): void {
        let balance = 0;
        this._appStateService.accounts.map((account) => {
            balance += account.balance;
        });
        this._appStateService.totalBalance = this._util.numberWithCommas(balance, 6);
    }

    /** Reloads the dashboard, keeps previously-loaded accounts. */
    refreshBalances(): void {
        this._appStateService.accounts = [];
        const indexesToLoad = this._walletStorageService.getLoadedIndexes();
        if (!indexesToLoad || indexesToLoad.length === 0) {
            this._walletEventService.addIndexes.next([0]);
        } else {
            void this.refreshDashboardUsingIndexes(indexesToLoad);
        }
    }

    private async _addIndex(index: number): Promise<void> {
        await this.fetchAccount(index).catch((err) => {
            console.error(err);
        });
    }
}
