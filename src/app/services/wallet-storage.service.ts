import { Injectable } from '@angular/core';
import { ACTIVE_WALLET_ID } from '@app/services/transaction.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { UtilService } from '@app/services/util.service';

export type LocalStorageWallet = {
    encryptedSeed: string;
    walletId: string;
    name: string;
    loadedIndexes: number[];
};

const ENCRYPTED_WALLETS = 'bananostand_encryptedWallets';
const LEDGER_STORED_INDEXES = 'bananostand_ledgerIndexes';

@Injectable({
    providedIn: 'root',
})

/** Responsible for managing anything stored in localstorage -
 * wallet names, wallet ids, active wallet id, account indexes per wallet */
export class WalletStorageService {
    isLedger: boolean;
    activeWallet: LocalStorageWallet;
    wallets: LocalStorageWallet[];

    constructor(private readonly _util: UtilService, private readonly _walletEventsService: WalletEventsService) {
        this._walletEventsService.walletUnlocked.subscribe((data) => {
            this.isLedger = data.isLedger;
            this._updateState();
        });

        this._walletEventsService.addWallet.subscribe((wallet: LocalStorageWallet) => {
            this._walletEventsService.activeWalletChange.next(wallet);
        });

        this._walletEventsService.activeWalletChange.subscribe((wallet: LocalStorageWallet) => {
            this._makeWalletActive(wallet);
            this._updateState();
        });

        this._walletEventsService.reencryptWalletSecret.subscribe((wallet: LocalStorageWallet) => {
            this._storeWalletDetails(wallet);
            this._updateState();
        });

        this._walletEventsService.addIndex.subscribe((addedIndex) => {
            this._addIndexToLocalStorage(addedIndex);
            this._updateState();
        });

        this._walletEventsService.addIndexes.subscribe((addedIndexes) => {
            addedIndexes.map((addedIndex) => this._addIndexToLocalStorage(addedIndex));
            this._updateState();
        });

        this._walletEventsService.removeIndex.subscribe((removedIndex: number) => {
            this._removeIndexFromLocalStorage(removedIndex);
            this._updateState();
        });

        this._walletEventsService.renameWallet.subscribe((newWalletName: string) => {
            const wallet = this.getActiveWallet();
            wallet.name = newWalletName;
            this._makeWalletActive(wallet);
            this._updateState();
        });

        this._walletEventsService.removeWallet.subscribe(() => {
            this._removeActiveWallet();
            const newActiveWallet = this.getActiveWallet();
            if (!newActiveWallet) {
                this._walletEventsService.walletLocked.next();
            }
            this._updateState();
            this._walletEventsService.activeWalletChange.next(newActiveWallet);
        });
    }

    getActiveWalletId(): string {
        if (!this.isLedger) {
            // Ledger wallets do not have an active id.
            return String(window.localStorage.getItem(ACTIVE_WALLET_ID));
        }
        console.error('Ledger Account is Loaded, attempted to getActiveWalletId');
    }

    private _getLedgerWallet(): LocalStorageWallet {
        return {
            encryptedSeed: undefined,
            walletId: undefined,
            name: 'Ledger Wallet',
            loadedIndexes: this.getLoadedIndexes(),
        };
    }

    readWalletsFromLocalStorage(): LocalStorageWallet[] {
        if (this.isLedger) {
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
        if (this.isLedger) {
            return this._getLedgerWallet();
        }
        const id = this.getActiveWalletId();
        return this.getWalletFromId(id);
    }

    getLoadedIndexes(): number[] {
        if (this.isLedger) {
            const ledgerIndexes = JSON.parse(window.localStorage.getItem(LEDGER_STORED_INDEXES)) || [];
            return ledgerIndexes;
        }
        const wallet = this.getActiveWallet();
        return wallet.loadedIndexes;
    }

    getWalletFromId(id: string): LocalStorageWallet {
        for (const wallet of this.readWalletsFromLocalStorage()) {
            if (this._walletIdsMatch(id, wallet.walletId)) {
                return wallet;
            }
        }
    }

    private _walletIdsMatch(s1: string, s2: string): boolean {
        return String(s1) === String(s2);
    }

    private _makeWalletActive(wallet: LocalStorageWallet): void {
        if (wallet) {
            this._storeWalletDetails(wallet);
            this._setActiveWalletId(wallet.walletId);
        }
    }

    private _setDisplayedAccountIndexes(indexes: number[]): void {
        if (this.isLedger) {
            window.localStorage.setItem(LEDGER_STORED_INDEXES, JSON.stringify(indexes));
        } else {
            const wallet = this.getActiveWallet();
            if (wallet) {
                wallet.loadedIndexes = indexes;
                this._storeWalletDetails(wallet);
            }
        }
    }

    /** Used to store or update wallet details in localStorage. */
    private _storeWalletDetails(newWallet: LocalStorageWallet): void {
        const oldWallets = this.readWalletsFromLocalStorage();
        const newWallets = [newWallet];
        for (const wallet of oldWallets) {
            if (this._walletIdsMatch(wallet.walletId, newWallet.walletId)) {
                newWallets.push(wallet);
            }
        }
        this.wallets = newWallets;
        window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(newWallets));
    }

    private _setActiveWalletId(walletId: string): void {
        window.localStorage.setItem(ACTIVE_WALLET_ID, String(walletId));
        this.activeWallet = this.getActiveWallet();
    }

    private _addIndexToLocalStorage(addedIndex: number): void {
        const loadedIndexes = this.getLoadedIndexes();
        loadedIndexes.push(addedIndex);
        this._setDisplayedAccountIndexes(loadedIndexes);
    }

    private _removeIndexFromLocalStorage(removedIndex: number): void {
        let remainingIndexes = this.getActiveWallet().loadedIndexes;
        remainingIndexes = remainingIndexes.filter((index) => !this._util.matches(index, removedIndex));
        this._setDisplayedAccountIndexes(remainingIndexes);
    }

    private _removeActiveWallet(): void {
        const activeWallet = this.getActiveWallet();
        const remainingWallets = [];
        for (const wallet of this.readWalletsFromLocalStorage()) {
            if (this._walletIdsMatch(activeWallet.walletId, wallet.walletId)) {
                remainingWallets.push(wallet);
            }
        }
        if (remainingWallets[0]) {
            window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(remainingWallets));
            const activeId = remainingWallets[0].walletId;
            this._setActiveWalletId(activeId);
        } else {
            window.localStorage.removeItem(ENCRYPTED_WALLETS);
            window.localStorage.removeItem(ACTIVE_WALLET_ID);
        }
    }

    private _updateState(): void {
        this.activeWallet = this.getActiveWallet();
        this.wallets = this.readWalletsFromLocalStorage();
    }
}
