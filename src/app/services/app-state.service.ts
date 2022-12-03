import { Injectable } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';
import { BehaviorSubject } from 'rxjs';

export type AppStore = {
    /** User has a wallet (encrypted seed) stored in localstorage. */
    hasSecret: boolean;
    /** User has unlocked the wallet using a Nano Ledger device. */
    hasUnlockedLedger: boolean;
    /** User has unlocked the wallet using a secret / password combo. */
    hasUnlockedSecret: boolean;
    /** The password used to unlock the encrypted wallet. */
    walletPassword: string;
    /** The list of wallets stored in localstorage. These use a secret. */
    localStorageWallets: LocalStorageWallet[];
    /** The wallet that is displayed on the dashboard page. */
    activeWallet: LocalStorageWallet;
    /** Aggregate balance of all loaded accounts. */
    totalBalance: number;
    /** Loaded ledger accounts, their rep, & respective balances.  */
    accounts: AccountOverview[];
    /** Accounts on the dashboard are being loaded. */
    isLoadingAccounts: boolean;
};

@Injectable({
    providedIn: 'root',
})
export class AppStateService {
    /** Whether the wallet has been unlocked using a ledger physical device. */
    isLedger: boolean;

    /** Map of address to alias, contains all known aliases. */
    knownAccounts: Map<string, string> = new Map<string, string>();

    /** Set of online representatives. */
    onlineRepresentatives: Set<string> = new Set();

    store: BehaviorSubject<AppStore> = new BehaviorSubject<AppStore>({
        accounts: [],
        hasSecret: undefined, // Set on init.
        hasUnlockedSecret: false,
        hasUnlockedLedger: false,
        walletPassword: undefined,
        localStorageWallets: [],
        activeWallet: undefined,
        totalBalance: 0,
        isLoadingAccounts: true,
    });
}
