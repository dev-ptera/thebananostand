import { Injectable } from '@angular/core';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { UtilService } from '@app/services/util.service';
import { AppStateService } from '@app/services/app-state.service';

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
    constructor(
        private readonly _util: UtilService,
        private readonly _appStateService: AppStateService,
        private readonly _walletEventService: WalletEventsService
    ) {
        this._updateState();

        /*
        this._walletEventService.unlockWallet.subscribe((data) => {
            //   this._appStateService.isLedger = data.isLedger;
            this._updateState();
        }); */

        /*
        this._walletEventService.addWallet.subscribe((wallet: LocalStorageWallet) => {
            this._setActiveWallet(wallet);
            this.addWalletLocalStorage(wallet);
            this._walletEventService.activeWalletChange.next(wallet);
        }); */

        this._walletEventService.activeWalletChange.subscribe((wallet: LocalStorageWallet) => {
            this._setActiveWallet(wallet);
        });

        this._walletEventService.reencryptWalletSecret.subscribe((wallet: LocalStorageWallet) => {
            this.addWalletLocalStorage(wallet);
        });

        this._walletEventService.addIndexes.subscribe((addedIndexes) => {
            addedIndexes.map((addedIndex) => this._addIndexToLocalStorage(addedIndex));
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

    hasSecretWalletSaved(): boolean {
        const encryptedWallets = this.readWalletsFromLocalStorage();
        return encryptedWallets && encryptedWallets.length > 0;
    }

    createNewWallet(encryptedSeed: string): LocalStorageWallet {
        const walletId = encryptedSeed.substring(0, 10);
        return {
            walletId,
            name: this.createNewWalletName(),
            encryptedSeed,
            loadedIndexes: [0],
        }
    }

    getLoadedIndexes(): number[] {
        if (this._appStateService.isLedger) {
            const ledgerIndexes = JSON.parse(window.localStorage.getItem(LEDGER_STORED_INDEXES)) || [];
            return ledgerIndexes;
        }
        const wallet = this.getActiveWallet();
        return wallet.loadedIndexes;
    }

    getWalletFromId(id: string): LocalStorageWallet {
        for (const wallet of this._appStateService.wallets) {
            if (this._walletIdsMatch(id, wallet.walletId)) {
                return wallet;
            }
        }
    }

    /** Creates a wallet name for the user, based on the number of Unnamed Wallets. */
    createNewWalletName(): string {
        const unnamedWallet = 'Unnamed Wallet';
        const walletNameSet = new Set<string>();
        if (!this._appStateService.wallets || this._appStateService.wallets.length === 0) {
            return `${unnamedWallet} #1`;
        }

        this._appStateService.wallets.map((wallet) => walletNameSet.add(wallet.name));

        let index = 0;
        while (index++ <= walletNameSet.size) {
            const createdName = `${unnamedWallet} #${index}`;
            if (!walletNameSet.has(createdName)) {
                return createdName;
            }
        }
    }

    /** Only applicable to secret-based wallets.  Returns the current-selected wallet's localstorage ID. */
    private _readActiveWalletFromLocalStorage(): string {
        if (!this._appStateService.isLedger) {
            // Ledger wallets do not have an active id.
            return String(window.localStorage.getItem(ACTIVE_WALLET_ID));
        }
        console.error('Ledger Account is Loaded, attempted to getActiveWalletId');
    }

    /** Returns the list of available wallets. */
    readWalletsFromLocalStorage(): LocalStorageWallet[] {
        if (this._appStateService.isLedger) {
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

     getActiveWallet(): LocalStorageWallet {
        if (this._appStateService.isLedger) {
            return this._getLedgerWallet();
        }
        const id = this._readActiveWalletFromLocalStorage();
        return this.getWalletFromId(id);
    }

    private _walletIdsMatch(s1: string, s2: string): boolean {
        return String(s1) === String(s2);
    }

    /** Used to store or update wallet details in localStorage. */
    addWalletLocalStorage(newWallet: LocalStorageWallet): void {
        const wallets = this._appStateService.wallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, newWallet.walletId)
        );
        wallets.push(newWallet);
        window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(wallets));
       // this._updateState();
    }

    private _setActiveWallet(wallet: LocalStorageWallet): void {
        this._appStateService.activeWallet = wallet;
        window.localStorage.setItem(ACTIVE_WALLET_ID, String(wallet.walletId));
    }

    /** Writes to localstorage active wallet displayed accounts. */
    private _setDisplayedAccountIndexes(indexes: number[]): void {
        if (this._appStateService.isLedger) {
            window.localStorage.setItem(LEDGER_STORED_INDEXES, JSON.stringify(indexes));
        } else {
            this._appStateService.activeWallet.loadedIndexes = indexes;
            this.addWalletLocalStorage(this._appStateService.activeWallet);
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
        const remainingIndexes = this._appStateService.activeWallet.loadedIndexes.filter(
            (index) => !this._util.matches(index, removedIndex)
        );
        this._setDisplayedAccountIndexes(remainingIndexes);
        this._updateState();
    }

    /** Removes a specified wallet from localstorage & returns the new active wallet, if any. */
    private _removeWalletById(activeWalletId: string): LocalStorageWallet {
        const remainingWallets = this._appStateService.wallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, activeWalletId)
        );

        const hasNewActiveWallet = Boolean(remainingWallets[0]);
        if (hasNewActiveWallet) {
            window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(remainingWallets));
            const newActiveWallet = remainingWallets[0];
            this._setActiveWallet(newActiveWallet);
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
        this._appStateService.wallets = this.readWalletsFromLocalStorage();
        if (this._appStateService.isLedger) {
            this._appStateService.activeWallet = this._getLedgerWallet();
        } else {
            const id = this._readActiveWalletFromLocalStorage();
            this._appStateService.activeWallet = this.getWalletFromId(id);
        }
    }
}
