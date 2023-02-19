import { Injectable } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { PriceData } from '@app/types/PriceData';

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
    /** What users would like their balances to be converted into. */
    localCurrencyCode: string;
    /** The user-specified currency must be multiplied by this number to be converted to USD. */
    localCurrencyConversionRate: number;
    /** The list of wallets stored in localstorage. These use a secret. */
    localStorageWallets: LocalStorageWallet[];
    /** Banano Price, Bitcoin Price in USD */
    priceDataUSD: PriceData;
    /** Aggregate balance of all loaded accounts. */
    totalBalance: number;
    /** The password used to unlock the encrypted wallet. */
    walletPassword: string;
    /** Determines how the Dashboard page looks. Can either be table or card. */
    preferredDashboardView: 'card' | 'table';
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
        localCurrencyCode: undefined,
        localCurrencyConversionRate: 0,
        priceDataUSD: {
            bitcoinPriceUsd: undefined,
            bananoPriceUsd: undefined,
        },
        localStorageWallets: [],
        activeWallet: undefined,
        totalBalance: 0,
        isLoadingAccounts: true,
        preferredDashboardView: undefined,
    });

    appLocalStorage = new Subject<{
        localizationCurrencyCode: string;
        addressBook: Map<string, string>;
        activeWallet: LocalStorageWallet;
        localStorageWallets: LocalStorageWallet[];
        preferredDashboardView: string;
    }>();
}
