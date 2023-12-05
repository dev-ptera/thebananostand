import { Injectable } from '@angular/core';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { AddressBookEntry } from '@app/types/AddressBookEntry';
import { ViewportService } from '@app/services/viewport.service';

export type LocalStorageWallet = {
    encryptedSeed: string;
    walletId: string;
    name: string;
    loadedIndexes: number[];
};

export type WalletState = { activeWallet: LocalStorageWallet; localStorageWallets: LocalStorageWallet[] };

const ACTIVE_WALLET_ID = 'activeWalletID';
const LOCALIZATION_CURRENCY_CODE = 'bananostand_localizationCurrencyCode';
const ENCRYPTED_WALLETS = 'bananostand_encryptedWallets';
const ADDRESS_BOOK = 'bananostand_addressBook';
const LEDGER_STORED_INDEXES = 'bananostand_ledgerIndexes';
const PREFERRED_DASHBOARD_VIEW = 'bananostand_dashboardView';
const IDLE_TIMEOUT_MINUTES = 'bananostand_idleTimeoutMinutes';
const MINIMUM_INCOMING_THRESHOLD_BAN = 'bananostand_minimumIncomingBananoThreshold';
const CUSTOM_RPC_NODE_URLS = 'bananostand_customRpcNodeURLs';

@Injectable({
    providedIn: 'root',
})

/** Responsible for managing anything stored in localstorage -
 * wallet names, wallet ids, active wallet id, account indexes per wallet */
export class WalletStorageService {
    store: AppStore;

    constructor(
        private readonly _vp: ViewportService,
        private readonly _appStateService: AppStateService
    ) {
        this._appStateService.store.subscribe((store) => {
            this.store = store;
        });

        // Listen for the updated store and write to localstorage accordingly.
        // `store` & `localStorage` will always match.
        this._appStateService.appLocalStorage.subscribe((walletData) => {
            if (walletData.customRpcNodeURLs !== undefined && walletData.customRpcNodeURLs[0] !== undefined) {
                this.store.customRpcNodeURLs.push(walletData.customRpcNodeURLs[0]);
                const urls = this.store.customRpcNodeURLs.toString();
                debugger;
                window.localStorage.setItem(CUSTOM_RPC_NODE_URLS, urls);
            }

            if (walletData.minimumBananoThreshold !== undefined) {
                window.localStorage.setItem(MINIMUM_INCOMING_THRESHOLD_BAN, String(walletData.minimumBananoThreshold));
            }

            if (walletData.idleTimeoutMinutes) {
                window.localStorage.setItem(IDLE_TIMEOUT_MINUTES, String(walletData.idleTimeoutMinutes));
            }

            if (walletData.preferredDashboardView) {
                window.localStorage.setItem(PREFERRED_DASHBOARD_VIEW, walletData.preferredDashboardView);
            }

            if (walletData.localizationCurrencyCode) {
                window.localStorage.setItem(LOCALIZATION_CURRENCY_CODE, walletData.localizationCurrencyCode);
            }

            if (walletData.addressBook && walletData.addressBook.keys.length === 0) {
                window.localStorage.removeItem(ADDRESS_BOOK);
            }

            if (walletData.localStorageWallets && walletData.localStorageWallets.length === 0) {
                window.localStorage.removeItem(ACTIVE_WALLET_ID);
                window.localStorage.removeItem(ENCRYPTED_WALLETS);
                return;
            }

            if (walletData.localStorageWallets) {
                window.localStorage.setItem(ENCRYPTED_WALLETS, JSON.stringify(walletData.localStorageWallets));
            }

            if (walletData.addressBook) {
                this._writeAddressBookLocalStore(walletData.addressBook);
            }

            if (walletData.activeWallet) {
                if (this.store.hasUnlockedLedger) {
                    window.localStorage.setItem(
                        LEDGER_STORED_INDEXES,
                        JSON.stringify(walletData.activeWallet.loadedIndexes)
                    );
                } else {
                    window.localStorage.setItem(ACTIVE_WALLET_ID, String(walletData.activeWallet.walletId));
                }
            }
        });
    }

    /** Reads browser's localstorage for a list of address and their respective aliases. */
    readAddressBookFromLocalStorage(): Map<string, string> {
        const json = window.localStorage.getItem(ADDRESS_BOOK);
        const addressBookEntries = json ? JSON.parse(json) : [];
        const map = new Map<string, string>();
        addressBookEntries.forEach((entry: AddressBookEntry) => {
            map.set(entry.account, entry.name);
        });
        return map;
    }

    readIdleTimeoutMinutes(): number {
        const timeoutMinutes = window.localStorage.getItem(IDLE_TIMEOUT_MINUTES);
        if (timeoutMinutes) {
            return Number(timeoutMinutes);
        }
        return 15;
    }

    readMinimumBananoIncomingThreshold(): number {
        const threshold = window.localStorage.getItem(MINIMUM_INCOMING_THRESHOLD_BAN);
        if (threshold) {
            return Number(threshold);
        }
        return 0;
    }

    readPreferredDashboardViewFromLocalStorage(): 'table' | 'card' {
        const preference = window.localStorage.getItem(PREFERRED_DASHBOARD_VIEW);
        if ((preference && preference === 'table') || preference === 'card') {
            return preference;
        }
        return this._vp.sm ? 'card' : 'table';
    }

    /** Given an encrypted seed, makes a wallet that is later stored in the browser. */
    createNewLocalStorageWallet(encryptedSeed: string): WalletState {
        const walletId = encryptedSeed.substring(0, 10);
        const activeWallet = {
            encryptedSeed,
            loadedIndexes: [0],
            name: `Unnamed Wallet ${this.store.localStorageWallets.length + 1}`,
            walletId,
        };
        this.store.localStorageWallets.push(activeWallet);
        return { activeWallet, localStorageWallets: this.store.localStorageWallets };
    }

    /** Returns a `WalletState` minus the active wallet. If there are any wallets remaining, the new active wallet is the first in the list. */
    removeActiveWallet(): WalletState {
        const remainingWallets = this.store.localStorageWallets.filter(
            (wallet) => !this._walletIdsMatch(wallet.walletId, this.store.activeWallet.walletId)
        );
        return { activeWallet: remainingWallets[0], localStorageWallets: remainingWallets };
    }

    /** Returns `WalletState` with updated wallet name. */
    updateWalletName(newWalletName: string): WalletState {
        this.store.activeWallet.name = newWalletName;
        this.store.localStorageWallets.forEach((wallet) => {
            if (this._walletIdsMatch(wallet.walletId, this.store.activeWallet.walletId)) {
                wallet.name = newWalletName;
            }
        });
        return { activeWallet: this.store.activeWallet, localStorageWallets: this.store.localStorageWallets };
    }

    /** Returns `WalletState` with an updated `loadedIndexes` prop. */
    updateWalletIndexes(accounts: AccountOverview[]): WalletState {
        const indexes = accounts.map((acc) => acc.index);
        this.store.activeWallet.loadedIndexes = indexes;
        this.store.localStorageWallets.forEach((wallet) => {
            if (wallet.walletId === this.store.activeWallet.walletId) {
                wallet.loadedIndexes = indexes;
            }
        });
        return { activeWallet: this.store.activeWallet, localStorageWallets: this.store.localStorageWallets };
    }

    hasSecretWalletSaved(): boolean {
        const encryptedWallets = this.readWalletsFromLocalStorage();
        return encryptedWallets && encryptedWallets.length > 0;
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

    /** Removes all secret-wallet-associated information from browser. */
    clearLocalStorage(): void {
        window.localStorage.removeItem(ENCRYPTED_WALLETS);
        window.localStorage.removeItem(ACTIVE_WALLET_ID);
        window.localStorage.removeItem(LOCALIZATION_CURRENCY_CODE);
    }

    readActiveWalletFromLocalStorage(): LocalStorageWallet {
        if (this.store.hasUnlockedLedger) {
            return this._getLedgerWallet();
        }
        const id = this.readActiveWalletIdFromLocalStorage();
        const wallets = this.readWalletsFromLocalStorage();
        for (const wallet of wallets) {
            if (wallet.walletId === id) {
                return wallet;
            }
        }

        // Default
        return wallets[0];
    }

    readCustomRpcNodeUrls(): string[] {
        const urls = localStorage.getItem(CUSTOM_RPC_NODE_URLS);
        if (!urls) {
            return [];
        }
        return urls.split(',');
    }

    /** Reads from local storage, defaults to USD. */
    readLocalizationCurrencyFromLocalStorage(): string {
        return window.localStorage.getItem(LOCALIZATION_CURRENCY_CODE) || 'USD';
    }

    /** Only applicable to secret-based wallets.  Returns the current-selected wallet's localstorage ID. */
    readActiveWalletIdFromLocalStorage(): string {
        if (!this.store.hasUnlockedLedger) {
            // Ledger wallets do not have an active id.
            return String(window.localStorage.getItem(ACTIVE_WALLET_ID));
        }
        console.error('Ledger Account is Loaded, attempted to getActiveWalletId');
    }

    private _walletIdsMatch(s1: string, s2: string): boolean {
        return String(s1) === String(s2);
    }

    private _getLedgerWallet(): LocalStorageWallet {
        return {
            encryptedSeed: undefined,
            walletId: undefined,
            name: 'Ledger Wallet',
            loadedIndexes: JSON.parse(window.localStorage.getItem(LEDGER_STORED_INDEXES)) || [],
        };
    }

    /** Writes a user's address book entries to the browser. */
    private _writeAddressBookLocalStore(addressBook: Map<string, string>): void {
        const accounts: AddressBookEntry[] = [];
        for (const address of addressBook.keys()) {
            accounts.push({ name: addressBook.get(address), account: address });
        }
        window.localStorage.setItem(ADDRESS_BOOK, JSON.stringify(accounts));
    }
}
