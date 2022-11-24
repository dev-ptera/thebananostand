import { Injectable } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';

@Injectable({
    providedIn: 'root',
})
export class AppStateService {
    /** Loaded ledger accounts, their rep, & respective balances.  */
    accounts: AccountOverview[] = [];

    /** Set of online representatives. */
    onlineRepresentatives: Set<string> = new Set();

    /** Map of address to alias, specific to reps. */
    repAliases: Map<string, string> = new Map<string, string>();

    /** Map of address to alias, contains all known aliases. */
    knownAccounts: Map<string, string> = new Map<string, string>();

    /** Aggregate balance of all loaded accounts. */
    totalBalance: string;

    /** Whether the wallet has been unlocked using a ledger physical device. */
    isLedger: boolean;

    /** The wallet that is displayed on the dashboard page. */
    activeWallet: LocalStorageWallet;

    /** The list of wallets stored in localstorage. These use a secret. */
    wallets: LocalStorageWallet[] = [];
}
