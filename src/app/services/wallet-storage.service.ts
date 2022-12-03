import { Injectable } from '@angular/core';
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

    constructor(private readonly _util: UtilService, private readonly _appStateService: AppStateService) {
        this._appStateService.store.subscribe((store) => {
            this.store = store;
            this._listenForAccountChanges();
        });
    }

    /** When the number of accounts saved in the store changes, we need to persist these changes in localstorage. */
    private _listenForAccountChanges(): void {}

    hasSecretWalletSaved(): boolean {
        const encryptedWallets = this.readWalletsFromLocalStorage();
        return encryptedWallets && encryptedWallets.length > 0;
    }

    createLocalStorageWallet(encryptedSeed: string): LocalStorageWallet {
        const walletId = encryptedSeed.substring(0, 10);
        return {
            walletId,
            name: this._createNewWalletName(),
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

    /** Returns the list of available wallets. */
    readWalletsFromLocalStorage(): LocalStorageWallet[] {
        if (this.store.hasUnlockedLedger) {
            return [this._getLedgerWallet()];
        }

        try {
            const encryptedWallets = JSON.parse(window.localStorage.getItem(ENCRYPTED_WALLETS)) as LocalStorageWallet[];
            if (!encryptedWallets || !encryptedWallets[0]) {
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
        const id = this.readActiveWalletIdFromLocalStorage();
        return this.getWalletFromId(id);
    }

    /** Only applicable to secret-based wallets.  Returns the current-selected wallet's localstorage ID. */
    readActiveWalletIdFromLocalStorage(): string {
        if (!this.store.hasUnlockedLedger) {
            // Ledger wallets do not have an active id.
            return String(window.localStorage.getItem(ACTIVE_WALLET_ID));
        }
        console.error('Ledger Account is Loaded, attempted to getActiveWalletId');
    }

    writeActiveWalletToLocalStorage(activeWallet: LocalStorageWallet): void {
        this.writeWalletToLocalStorage(activeWallet);
        this.writeActiveWalletIdToLocalStorage(activeWallet);
    }

    /** Stores wallet details in localStorage. */ // TODO Private
    writeWalletToLocalStorage(newWallet: LocalStorageWallet): void {
        const wallets = this.store.localStorageWallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, newWallet.walletId)
        );
        wallets.push(newWallet);
        window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(wallets));
    }

    writeActiveWalletIdToLocalStorage(wallet: LocalStorageWallet): void {
        // TODO Private
        window.localStorage.setItem(ACTIVE_WALLET_ID, String(wallet.walletId));
    }

    /** Writes to localstorage active wallet displayed accounts. */
    private _setDisplayedAccountIndexes(indexes: number[]): void {
        if (this.store.hasUnlockedLedger) {
            window.localStorage.setItem(LEDGER_STORED_INDEXES, JSON.stringify(indexes));
        } else {
            const wallet = this.store.activeWallet;
            wallet.loadedIndexes = indexes;
            this.writeWalletToLocalStorage(wallet);
        }
    }

    /** Creates a wallet name for the user, based on the number of Unnamed Wallets. */
    private _createNewWalletName(): string {
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

    private _walletIdsMatch(s1: string, s2: string): boolean {
        return String(s1) === String(s2);
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
            this.writeActiveWalletIdToLocalStorage(newActiveWallet);
            return newActiveWallet;
        }
        window.localStorage.removeItem(ENCRYPTED_WALLETS);
        window.localStorage.removeItem(ACTIVE_WALLET_ID);
    }

    private _getLedgerWallet(): LocalStorageWallet {
        return {
            encryptedSeed: undefined,
            walletId: undefined,
            name: 'Ledger Wallet',
            loadedIndexes: this.getLoadedIndexes(),
        };
    }
}
