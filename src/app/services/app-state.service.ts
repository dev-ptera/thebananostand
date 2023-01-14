import { Injectable } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';
import { BehaviorSubject, Subject } from 'rxjs';

export type AppStore = {
    /** Loaded ledger accounts, their rep, & respective balances.  */
    accounts: AccountOverview[];
    /** The wallet that is displayed on the dashboard page. */
    activeWallet: LocalStorageWallet;
    /** Manually entered accounts that are then stored in the browser for future use. */
    addressBook: Map<string, string>;
    /** User has a wallet (encrypted seed) stored in localstorage. */
    hasSecret: boolean;
    /** User has unlocked the wallet using a Nano Ledger device. */
    hasUnlockedLedger: boolean;
    /** User has unlocked the wallet using a secret / password combo. */
    hasUnlockedSecret: boolean;
    /** Accounts on the dashboard are being loaded. */
    isLoadingAccounts: boolean;
    /** The list of wallets stored in localstorage. These use a secret. */
    localStorageWallets: LocalStorageWallet[];
    /** Aggregate balance of all loaded accounts. */
    totalBalance: number;
    /** The password used to unlock the encrypted wallet. */
    walletPassword: string;
};

@Injectable({
    providedIn: 'root',
})
export class AppStateService {
    /** Map of address to alias, contains all known aliases. */
    knownAccounts: Map<string, string> = new Map<string, string>();

    /** Set of online representatives. */
    onlineRepresentatives: Set<string> = new Set();

    store: BehaviorSubject<AppStore> = new BehaviorSubject<AppStore>({
        accounts: [],
        addressBook: new Map<string, string>(),
        hasSecret: undefined, // Set on init.
        hasUnlockedSecret: false,
        hasUnlockedLedger: false,
        walletPassword: undefined,
        localStorageWallets: [],
        activeWallet: undefined,
        totalBalance: 0,
        isLoadingAccounts: true,
    });

    appLocalStorage = new Subject<{
        addressBook: Map<string, string>;
        activeWallet: LocalStorageWallet;
        localStorageWallets: LocalStorageWallet[];
    }>();
}
