import { Injectable } from '@angular/core';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { UtilService } from '@app/services/util.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';

export type LocalStorageWallet = {
    encryptedSeed: string;
    walletId: string;
    name: string;
    loadedIndexes: number[];
};

const ACTIVE_WALLET_ID = 'activeWalletID';
const ENCRYPTED_WALLETS = 'bananostand_encryptedWallets';
const LEDGER_STORED_INDEXES = 'bananostand_ledgerIndexes';

@Injectable({
    providedIn: 'root',
})

/** Responsible for managing anything stored in localstorage -
 * wallet names, wallet ids, active wallet id, account indexes per wallet */
export class WalletStorageService {
    store: AppStore;

    constructor(
        private readonly _util: UtilService,
        private readonly _appStateService: AppStateService,
        private readonly _walletEventService: WalletEventsService
    ) {
        this._appStateService.store.subscribe((store) => {
            this.store = store;
        });
    }
    /*

        this._updateState();

        this._walletEventService.activeWalletChange.subscribe((wallet: LocalStorageWallet) => {
            this.setActiveWallet(wallet);
        });

        this._walletEventService.reencryptWalletSecret.subscribe((wallet: LocalStorageWallet) => {
            this.addWalletLocalStorage(wallet);
        });

        this._walletEventService.removeIndex.subscribe((removedIndex: number) => {
            this._removeIndexFromLocalStorage(removedIndex);
        });

        this._walletEventService.renameWallet.subscribe((newWalletName: string) => {
            const activeWallet = this.getActiveWallet();
            activeWallet.name = newWalletName;
            this.addWalletLocalStorage(activeWallet);
        });

        this._walletEventService.removeWallet.subscribe(() => {
            const activeWalletId = this._readActiveWalletFromLocalStorage();
            const newActiveWallet = this._removeWalletById(activeWalletId);
            if (newActiveWallet) {
                this._walletEventService.activeWalletChange.next(newActiveWallet);
            } else {
                this._walletEventService.lockWallet.next();
            }
        });

        this._walletEventService.clearLocalStorage.subscribe(() => {
            window.localStorage.clear();
            this._updateState();
            this._walletEventService.lockWallet.next();
        });
    }

         */

    hasSecretWalletSaved(): boolean {
        const encryptedWallets = this.readWalletsFromLocalStorage();
        return encryptedWallets && encryptedWallets.length > 0;
    }

    createLocalStorageWallet(encryptedSeed: string): LocalStorageWallet {
        const walletId = encryptedSeed.substring(0, 10);
        return {
            walletId,
            name: this.createNewWalletName(),
            encryptedSeed,
            loadedIndexes: [0],
        };
    }

    getLoadedIndexes(): number[] {
        if (this.store.hasUnlockedLedger) {
            const ledgerIndexes = JSON.parse(window.localStorage.getItem(LEDGER_STORED_INDEXES)) || [];
            return ledgerIndexes;
        }
        const wallet = this.readActiveWalletFromLocalStorage();
        return wallet.loadedIndexes;
    }

    getWalletFromId(id: string): LocalStorageWallet {
        const wallets = this.readWalletsFromLocalStorage();
        for (const wallet of wallets) {
            if (this._walletIdsMatch(id, wallet.walletId)) {
                return wallet;
            }
        }
    }

    /** Creates a wallet name for the user, based on the number of Unnamed Wallets. */
    createNewWalletName(): string {
        const unnamedWallet = 'Unnamed Wallet';
        const walletNameSet = new Set<string>();
        if (!this.store.localStorageWallets || this.store.localStorageWallets.length === 0) {
            return `${unnamedWallet} #1`;
        }

        this.store.localStorageWallets.map((wallet) => walletNameSet.add(wallet.name));

        let index = 0;
        while (index++ <= walletNameSet.size) {
            const createdName = `${unnamedWallet} #${index}`;
            if (!walletNameSet.has(createdName)) {
                return createdName;
            }
        }
    }

    /** Only applicable to secret-based wallets.  Returns the current-selected wallet's localstorage ID. */
    private _readActiveWalletIdLocalStorage(): string {
        if (!this.store.hasUnlockedLedger) {
            // Ledger wallets do not have an active id.
            return String(window.localStorage.getItem(ACTIVE_WALLET_ID));
        }
        console.error('Ledger Account is Loaded, attempted to getActiveWalletId');
    }

    /** Returns the list of available wallets. */
    readWalletsFromLocalStorage(): LocalStorageWallet[] {
        if (this.store.hasUnlockedLedger) {
            return [this._getLedgerWallet()];
        }

        try {
            const encryptedWallets = JSON.parse(window.localStorage.getItem(ENCRYPTED_WALLETS)) as LocalStorageWallet[];
            if (!encryptedWallets) {
                return [];
            }
            return encryptedWallets;
        } catch (err) {
            return [];
        }
    }

    readActiveWalletFromLocalStorage(): LocalStorageWallet {
        if (this.store.hasUnlockedLedger) {
            return this._getLedgerWallet();
        }
        const id = this._readActiveWalletIdLocalStorage();
        return this.getWalletFromId(id);
    }

    private _walletIdsMatch(s1: string, s2: string): boolean {
        return String(s1) === String(s2);
    }

    /** Stores wallet details in localStorage. */
    addWalletLocalStorage(newWallet: LocalStorageWallet): void {
        const wallets = this.store.localStorageWallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, newWallet.walletId)
        );
        wallets.push(newWallet);
        window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(wallets));
        // this._updateState();
    }

    writeActiveWallet(wallet: LocalStorageWallet): void {
        window.localStorage.setItem(ACTIVE_WALLET_ID, String(wallet.walletId));
    }

    /** Writes to localstorage active wallet displayed accounts. */
    private _setDisplayedAccountIndexes(indexes: number[]): void {
        if (this.store.hasUnlockedLedger) {
            window.localStorage.setItem(LEDGER_STORED_INDEXES, JSON.stringify(indexes));
        } else {
            this._appStateService.store.getValue().activeWallet.loadedIndexes = indexes;
            this.addWalletLocalStorage(this._appStateService.store.getValue().activeWallet);
        }
    }

    /** New addresses (index) are added to localstorage. */
    private _addIndexToLocalStorage(addedIndex: number): void {
        const loadedIndexes = this.getLoadedIndexes();
        loadedIndexes.push(addedIndex);
        this._setDisplayedAccountIndexes(loadedIndexes);
    }

    /** Given an account index, removes it from local storage. */
    private _removeIndexFromLocalStorage(removedIndex: number): void {
        const remainingIndexes = this._appStateService.store
            .getValue()
            .activeWallet.loadedIndexes.filter((index) => !this._util.matches(index, removedIndex));
        this._setDisplayedAccountIndexes(remainingIndexes);
        this._updateState();
    }

    /** Removes a specified wallet from localstorage & returns the new active wallet, if any. */
    private _removeWalletById(activeWalletId: string): LocalStorageWallet {
        const remainingWallets = this.store.localStorageWallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, activeWalletId)
        );

        const hasNewActiveWallet = Boolean(remainingWallets[0]);
        if (hasNewActiveWallet) {
            window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(remainingWallets));
            const newActiveWallet = remainingWallets[0];
            this.writeActiveWallet(newActiveWallet);
            this._updateState();
            return newActiveWallet;
        }
        window.localStorage.removeItem(ENCRYPTED_WALLETS);
        window.localStorage.removeItem(ACTIVE_WALLET_ID);
        this._updateState();
    }

    private _getLedgerWallet(): LocalStorageWallet {
        return {
            encryptedSeed: undefined,
            walletId: undefined,
            name: 'Ledger Wallet',
            loadedIndexes: this.getLoadedIndexes(),
        };
    }

    private _updateState(): void {
        this.store.localStorageWallets = this.readWalletsFromLocalStorage();
        if (this.store.hasUnlockedLedger) {
            this._appStateService.store.getValue().activeWallet = this._getLedgerWallet();
        } else {
            const id = this._readActiveWalletIdLocalStorage();
            this._appStateService.store.getValue().activeWallet = this.getWalletFromId(id);
        }
    }
}
