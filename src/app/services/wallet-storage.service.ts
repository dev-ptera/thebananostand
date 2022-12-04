import { Injectable } from '@angular/core';
import { UtilService } from '@app/services/util.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { AccountOverview } from '@app/types/AccountOverview';

export type LocalStorageWallet = {
    encryptedSeed: string;
    walletId: string;
    name: string;
    loadedIndexes: number[];
};

const ACTIVE_WALLET_ID = 'activeWalletID';
const ENCRYPTED_WALLETS = 'bananostand_encryptedWallets';
const LEDGER_STORED_INDEXES = 'bananostand_ledgerIndexes';

export type WalletState = { activeWallet: LocalStorageWallet; localStorageWallets: LocalStorageWallet[] };

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
        });
        // LISTEN FOR UPDATED STORE HERE, UPDATED LOCALSTORAGE ACCORDINGLY.
        this._appStateService.appLocalStorage.subscribe((walletData) => {
            if (walletData.activeWallet) {
                window.localStorage.setItem(ACTIVE_WALLET_ID, String(walletData.activeWallet.walletId));
                window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(walletData.localStorageWallets));
            } else {
                window.localStorage.removeItem(ACTIVE_WALLET_ID);
                window.localStorage.removeItem(ENCRYPTED_WALLETS);
            }
        });
    }

    removeActiveWallet(): WalletState {
        const remainingWallets = this.store.localStorageWallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, this.store.activeWallet.walletId)
        );
        if (remainingWallets.length === 0) {
            return { activeWallet: null, localStorageWallets: [] };
        }
        return { activeWallet: remainingWallets[0], localStorageWallets: remainingWallets };
    }

    updateWalletName(newWalletName: string): WalletState {
        this.store.activeWallet.name = newWalletName;
        this.store.localStorageWallets.forEach((wallet) => {
            if (this._walletIdsMatch(wallet.walletId, this.store.activeWallet.walletId)) {
                wallet.name = newWalletName;
            }
        });
        return { activeWallet: this.store.activeWallet, localStorageWallets: this.store.localStorageWallets };
    }

    writeLocalStorageUpdates(accounts: AccountOverview[]): void {
        const indexes = accounts.map((acc) => acc.index);
        this.store.activeWallet.loadedIndexes = indexes;
        this.store.localStorageWallets.forEach((wallet) => {
            if (wallet.walletId === this.store.activeWallet.walletId) {
                wallet.loadedIndexes = indexes;
            }
        });
        this.writeActiveWalletToLocalStorage(this.store.activeWallet);
    }

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

    writeActiveWalletToLocalStorage(activeWallet: LocalStorageWallet): WalletState {
        return {
            activeWallet: this._writeActiveWalletIdToLocalStorage(activeWallet),
            localStorageWallets: this._writeWalletToLocalStorage(activeWallet),
        };
    }

    /** Stores wallet details in localStorage. */
    private _writeActiveWalletIdToLocalStorage(wallet: LocalStorageWallet): LocalStorageWallet {
        window.localStorage.setItem(ACTIVE_WALLET_ID, String(wallet.walletId));
        return wallet;
    }

    /** Stores wallet details in localStorage. */
    private _writeWalletToLocalStorage(newWallet: LocalStorageWallet): LocalStorageWallet[] {
        const wallets = this.store.localStorageWallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, newWallet.walletId)
        );
        wallets.push(newWallet);
        window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(wallets));
        return wallets;
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

    private _getLedgerWallet(): LocalStorageWallet {
        return {
            encryptedSeed: undefined,
            walletId: undefined,
            name: 'Ledger Wallet',
            loadedIndexes: this.getLoadedIndexes(),
        };
    }
}
