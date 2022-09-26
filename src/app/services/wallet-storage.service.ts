import { Injectable } from '@angular/core';
import { ACTIVE_WALLET_ID } from '@app/services/transaction.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { UtilService } from '@app/services/util.service';

export type LocalStorageWallet = {
    encryptedSeed: string;
    walletId: number;
    name: string;
    loadedIndexes: number[];
};

@Injectable({
    providedIn: 'root',
})

/** Responsible for managing anything stored in localstorage -
 * wallet names, wallet ids, active wallet id, account indexes per wallet */
export class WalletStorageService {
    private readonly ENCRYPTED_WALLETS = 'bananostand_encryptedWallets';

    activeWallet: LocalStorageWallet;
    wallets: LocalStorageWallet[];

    constructor(private readonly _util: UtilService, private readonly _walletEventsService: WalletEventsService) {

        this._walletEventsService.walletUnlocked.subscribe(() => {
            this._updateState();
        });

        /** Updated displayed wallet identifier. */
        this._walletEventsService.addWallet.subscribe((wallet: LocalStorageWallet) => {
            this._makeWalletActive(wallet);
            this._updateState();
            this._walletEventsService.activeWalletChange.next(wallet);
        });

        /** When a new account is added, save the index in local storage so that we can remember which accounts were loaded per wallet. */
        this._walletEventsService.addIndex.subscribe((addedIndex) => {
            this._addIndexToLocalStorage(addedIndex);
            this._updateState();
        });

        this._walletEventsService.activeWalletChange.subscribe((wallet: LocalStorageWallet) => {
            this._makeWalletActive(wallet);
            this._updateState();
        });

        this._walletEventsService.removeWallet.subscribe(() => {
            this._removeActiveWallet();
            const newActiveWallet = this.getActiveWallet();
            this._updateState();
            this._walletEventsService.activeWalletChange.next(newActiveWallet);
        })

        /** Each time an account is removed, localstorage is updated. */
        this._walletEventsService.removeIndex.subscribe((removedIndex: number) => {
            this._removeIndexFromLocalStorage(removedIndex);
            this._updateState();
        });
    }

    getActiveWalletId(): number {
        return Number(window.localStorage.getItem(ACTIVE_WALLET_ID));
    }

    getNumberOfWallets(): number {
        const wallets = this.getWallets();
        return wallets.length;
    }

    getWallets(): LocalStorageWallet[] {
        try {
            const encryptedWallets = JSON.parse(
                window.localStorage.getItem(this.ENCRYPTED_WALLETS)
            ) as LocalStorageWallet[];
            if (!encryptedWallets) {
                return [];
            }
            return encryptedWallets;
        } catch (err) {
            return [];
        }
    }

    getActiveWallet(): LocalStorageWallet {
        const id = this.getActiveWalletId();
        return this.getWalletFromId(id);
    }

    getWalletFromId(id: number): LocalStorageWallet {
        for (const wallet of this.getWallets()) {
            if (this._util.matches(wallet.walletId, id)) {
                return wallet;
            }
        }
    }

    private _makeWalletActive(wallet: LocalStorageWallet): void {
        this._storeWalletDetails(wallet);
        this._setActiveWalletId(wallet.walletId);
    }

    private _setDisplayedAccountIndexes(indexes: number[]): void {
        const wallet = this.getActiveWallet();
        wallet.loadedIndexes = indexes;
        this._storeWalletDetails(wallet);
    }

    /** Used to store or update wallet details in localStorage. */
    private _storeWalletDetails(newWallet: LocalStorageWallet): void {
        const oldWallets = this.getWallets();
        const newWallets = [newWallet];
        for (const wallet of oldWallets) {
            if (!this._util.matches(wallet.walletId, newWallet.walletId)) {
                newWallets.push(wallet);
            }
        }
        this.wallets = newWallets;
        window.localStorage.setItem(this.ENCRYPTED_WALLETS, JSON.stringify(newWallets));
    }

    private _setActiveWalletId(walletId: number): void {
        window.localStorage.setItem(ACTIVE_WALLET_ID, String(walletId));
        this.activeWallet = this.getActiveWallet();
    }

    private _addIndexToLocalStorage(addedIndex: number): void {
        const indexes = this.getActiveWallet().loadedIndexes;
        indexes.push(addedIndex);
        this._setDisplayedAccountIndexes(indexes);
    }

    private _removeIndexFromLocalStorage(removedIndex: number): void {
        let remainingIndexes = this.getActiveWallet().loadedIndexes;
        remainingIndexes = remainingIndexes.filter((index) => !this._util.matches(index, removedIndex));
        this._setDisplayedAccountIndexes(remainingIndexes);
    }

    private _removeActiveWallet(): void {
        const activeWallet = this.getActiveWallet();
        const remainingWallets = [];
        for (const wallet of this.getWallets()) {
            if (!this._util.matches(activeWallet.walletId, wallet.walletId)) {
                remainingWallets.push(wallet);
            }
        }
        window.localStorage.setItem(this.ENCRYPTED_WALLETS, JSON.stringify(remainingWallets));
        if (remainingWallets[0]) {
            const activeId = remainingWallets[0].walletId;
            this._setActiveWalletId(activeId);
        } else {
            window.localStorage.removeItem(ACTIVE_WALLET_ID);
        }
    }

    private _updateState(): void {
        this.activeWallet = this.getActiveWallet();
        this.wallets = this.getWallets();
    }

}
