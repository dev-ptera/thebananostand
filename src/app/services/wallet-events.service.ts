import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LocalStorageWallet, WalletStorageService } from '@app/services/wallet-storage.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { UtilService } from '@app/services/util.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SecretService } from '@app/services/secret.service';
import { AccountService } from '@app/services/account.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { SignerService } from '@app/services/signer.service';
import { AddressBookEntry } from '@app/types/AddressBookEntry';
import { SpyglassService } from '@app/services/spyglass.service';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';

const SNACKBAR_DURATION = 3000;
const SNACKBAR_CLOSE_ACTION_TEXT = 'Dismiss';
const sortAccounts = (accounts): AccountOverview[] => accounts.sort((a, b) => (a.index < b.index ? -1 : 1));

/** User has request next sequential index be added to the dashboard. */
export const ADD_NEXT_ACCOUNT_BY_INDEX = new Subject<void>();

/** New addresses (index) has been added to the dashboard. */
export const ADD_SPECIFIC_ACCOUNTS_BY_INDEX = new Subject<number[]>();

/** User has attempted to unlock an encrypted secret wallet using a password. */
export const ATTEMPT_UNLOCK_WALLET_WITH_PASSWORD = new Subject<{ password: string }>();

/** User wants to unlock the ledger device. */
export const ATTEMPT_UNLOCK_LEDGER_WALLET = new Subject<void>();

/** The actively displayed wallet on the dashboard has changed to another. */
export const CHANGE_ACTIVE_WALLET = new Subject<LocalStorageWallet>();

/** All wallets need to have their password changed. */
export const CHANGE_PASSWORD = new Subject<{ currentPassword: string; newPassword: string }>();

/** All wallets have had their password changed. */
export const CHANGE_PASSWORD_SUCCESS = new Subject<void>();

/** An issue was encountered while attempting to change password. */
export const CHANGE_PASSWORD_ERROR = new Subject<{ error: string }>();

/** User has copied account address to clipboard. */
export const COPY_ADDRESS_TO_CLIPBOARD = new Subject<{ address: string }>();

/** Backup active wallet Mnemonic Phrase to clipboard */
export const COPY_MNEMONIC_TO_CLIPBOARD = new Subject<{ mnemonic: string; openSnackbar: boolean }>();

/** Backup active wallet seed to clipboard  */
export const COPY_SEED_TO_CLIPBOARD = new Subject<{ seed: string; openSnackbar: boolean }>();

/** User ran into an issue connection their ledger. */
export const EMIT_LEDGER_CONNECTION_ERROR = new Subject<{ error: string }>();

/** A new secret (either seed or mnemonic phrase) has been provided. */
export const IMPORT_NEW_WALLET_FROM_SECRET = new Subject<{ secret: string; password: string }>();

/** A wallet (previously unlocked with a password) has been logged out. */
export const LOCK_WALLET = new Subject<void>();

/** An address (index) has been removed from the dashboard. */
export const REMOVE_ACCOUNTS_BY_INDEX = new Subject<number[]>();

/** User has requested a specific account be refreshed. */
export const REFRESH_SPECIFIC_ACCOUNT_BY_INDEX = new Subject<number>();

/** User has requested that all loaded indexes be refreshed, checking for receivable transactions and updating account balances. */
export const REFRESH_DASHBOARD_ACCOUNTS = new Subject<void>();

/** The active wallet has been given an alias. */
export const RENAME_ACTIVE_WALLET = new Subject<string>();

/** The user wants to manually add an address to their address book. */
export const UPDATE_ADDRESS_BOOK = new Subject<AddressBookEntry>();

/** The user wants to manually add an address to their address book. */
export const REMOVE_ADDRESS_BOOK_ENTRY = new Subject<AddressBookEntry>();

/** The active wallet has been removed. */
export const REMOVE_ACTIVE_WALLET = new Subject<void>();

/** User has opted to delete all locally stored info. */
export const REMOVE_ALL_WALLET_DATA = new Subject<void>();

/** User has requested a backup action */
export const REQUEST_BACKUP_SECRET = new Subject<{ useMnemonic: boolean }>();

/** An account is being added to the dashboard. Can be either true or false. */
export const SET_DASHBOARD_ACCOUNT_LOADING = new BehaviorSubject<boolean>(true);

/** A transaction has been broadcast onto the network successfully. */
export const TRANSACTION_COMPLETED_SUCCESS = new Subject<string | undefined>();

/** A wallet (either secret or ledger) has been unlocked. */
export const UNLOCK_WALLET = new Subject<{ isLedger: boolean; password: string }>();

/** User has provided an incorrect password to unlock the wallet. */
export const UNLOCK_WALLET_WITH_PASSWORD_ERROR = new Subject<void>();

/** User has changed which currency they want to use when converting Banano to currency amounts. */
export const SELECT_LOCALIZATION_CURRENCY = new Subject<string>();

@Injectable({
    providedIn: 'root',
})
export class WalletEventsService {
    store: AppStore;

    constructor(
        private readonly _util: UtilService,
        private readonly _snackbar: MatSnackBar,
        private readonly _signerService: SignerService,
        private readonly _secretService: SecretService,
        private readonly _accountService: AccountService,
        private readonly _spyglassService: SpyglassService,
        private readonly _appStateService: AppStateService,
        private readonly _walletStorageService: WalletStorageService,
        private readonly _currencyConversionService: CurrencyConversionService
    ) {
        // _dispatch initial app state
        this._dispatch({
            activeWallet: undefined,
            localCurrencyCode: this._walletStorageService.readLocalizationCurrencyFromLocalStorage(),
            addressBook: this._walletStorageService.readAddressBookFromLocalStorage(),
            hasSecret: this._walletStorageService.hasSecretWalletSaved(),
            localStorageWallets: this._walletStorageService.readWalletsFromLocalStorage(),
        });

        this._appStateService.store.subscribe((store) => {
            this.store = store;
        });

        ADD_NEXT_ACCOUNT_BY_INDEX.subscribe(() => {
            const nextIndex = this._accountService.findNextUnloadedIndex();
            ADD_SPECIFIC_ACCOUNTS_BY_INDEX.next([nextIndex]);
        });

        ADD_SPECIFIC_ACCOUNTS_BY_INDEX.subscribe(async (indexes: number[]) => {
            const accounts = this.store.accounts;
            this._dispatch({ isLoadingAccounts: true });
            for await (const index of indexes) {
                const account = await this._accountService.fetchAccount(index);
                if (account) {
                    accounts.push(account);
                    const totalBalance = this._accountService.calculateLoadedAccountsTotalBalance(accounts);
                    this._dispatch({ accounts: sortAccounts(accounts), totalBalance });
                }
            }
            const { activeWallet, localStorageWallets } = this._walletStorageService.updateWalletIndexes(accounts);
            this._dispatch({
                activeWallet,
                localStorageWallets,
                isLoadingAccounts: false,
                accounts: sortAccounts(accounts),
            });
        });

        ATTEMPT_UNLOCK_LEDGER_WALLET.subscribe(async () => {
            try {
                await this._signerService.checkLedgerOrError();
                this._dispatch({ hasUnlockedLedger: true });
                UNLOCK_WALLET.next({ isLedger: true, password: undefined });
            } catch (err) {
                EMIT_LEDGER_CONNECTION_ERROR.next({ error: err });
            }
        });

        ATTEMPT_UNLOCK_WALLET_WITH_PASSWORD.subscribe(async (data) => {
            try {
                await this._secretService.unlockSecretWallet(data.password);
                UNLOCK_WALLET.next({
                    isLedger: false,
                    password: data.password,
                });
            } catch (err) {
                console.error(err);
                UNLOCK_WALLET_WITH_PASSWORD_ERROR.next();
            }
        });

        CHANGE_ACTIVE_WALLET.subscribe((activeWallet: LocalStorageWallet) => {
            this._dispatch({ activeWallet });
            REFRESH_DASHBOARD_ACCOUNTS.next();
        });

        CHANGE_PASSWORD.subscribe(({ currentPassword, newPassword }) => {
            this._secretService
                .changePassword(currentPassword, newPassword)
                .then(({ localStorageWallets, walletPassword }) => {
                    const activeWallet = localStorageWallets[0];
                    this._dispatch({ activeWallet, localStorageWallets, walletPassword });
                    LOCK_WALLET.next();
                    CHANGE_PASSWORD_SUCCESS.next();
                })
                .catch((err: Error) => {
                    CHANGE_PASSWORD_ERROR.next({ error: err.message });
                });
        });

        COPY_ADDRESS_TO_CLIPBOARD.subscribe((data: { address: string }) => {
            this._util.clipboardCopy(data.address);
            if (data.address) {
                this._snackbar.open('Address Copied!', SNACKBAR_CLOSE_ACTION_TEXT, { duration: SNACKBAR_DURATION });
            }
        });

        COPY_MNEMONIC_TO_CLIPBOARD.subscribe((data: { mnemonic: string; openSnackbar: boolean }) => {
            this._util.clipboardCopy(data.mnemonic);
            if (data.openSnackbar) {
                this._snackbar.open('Wallet Mnemonic Phrase Copied!', SNACKBAR_CLOSE_ACTION_TEXT, {
                    duration: SNACKBAR_DURATION,
                });
            }
        });

        COPY_SEED_TO_CLIPBOARD.subscribe((data: { seed: string; openSnackbar: boolean }) => {
            this._util.clipboardCopy(data.seed);
            if (data.openSnackbar) {
                this._snackbar.open('Wallet Seed Copied!', SNACKBAR_CLOSE_ACTION_TEXT, { duration: SNACKBAR_DURATION });
            }
        });

        IMPORT_NEW_WALLET_FROM_SECRET.subscribe(async (data): Promise<void> => {
            try {
                const password = this.store.hasUnlockedSecret ? this.store.walletPassword : data.password;
                const { encryptedSecret, walletPassword } = await this._secretService.storeSecret(
                    data.secret,
                    password
                );
                const { activeWallet, localStorageWallets } =
                    this._walletStorageService.createNewLocalStorageWallet(encryptedSecret);
                this._dispatch({
                    hasSecret: true,
                    hasUnlockedSecret: true,
                    localStorageWallets,
                    walletPassword,
                });
                CHANGE_ACTIVE_WALLET.next(activeWallet);
            } catch (err: any) {
                console.error(err);
                this._snackbar.open(err.message, SNACKBAR_CLOSE_ACTION_TEXT, { duration: SNACKBAR_DURATION * 10 });
            }
        });

        LOCK_WALLET.subscribe(() => {
            this._dispatch({
                hasUnlockedLedger: false,
                hasUnlockedSecret: false,
                walletPassword: undefined,
            });
        });

        REFRESH_DASHBOARD_ACCOUNTS.subscribe(() => {
            this._dispatch({ accounts: [], isLoadingAccounts: true, totalBalance: 0 });
            const indexes = this.store.activeWallet.loadedIndexes;
            if (indexes.length === 0) {
                indexes.push(0);
            }
            ADD_SPECIFIC_ACCOUNTS_BY_INDEX.next(indexes);
            SELECT_LOCALIZATION_CURRENCY.next(this.store.localCurrencyCode);
        });

        REFRESH_SPECIFIC_ACCOUNT_BY_INDEX.subscribe(async (index) => {
            const newAccount = await this._accountService.fetchAccount(index);
            const accounts = this._accountService.removeAccounts([index]);
            accounts.push(newAccount);
            this._dispatch({
                accounts: sortAccounts(accounts),
                totalBalance: this._accountService.calculateLoadedAccountsTotalBalance(accounts),
            });
        });

        REMOVE_ACCOUNTS_BY_INDEX.subscribe((indexes: number[]) => {
            const accounts = this._accountService.removeAccounts(indexes);
            const { activeWallet, localStorageWallets } = this._walletStorageService.updateWalletIndexes(accounts);
            const totalBalance = this._accountService.calculateLoadedAccountsTotalBalance(accounts);
            this._dispatch({ accounts, activeWallet, localStorageWallets, totalBalance });
        });

        RENAME_ACTIVE_WALLET.subscribe((newWalletName: string) => {
            const { activeWallet, localStorageWallets } = this._walletStorageService.updateWalletName(newWalletName);
            this._dispatch({ activeWallet, localStorageWallets });
        });

        REMOVE_ADDRESS_BOOK_ENTRY.subscribe((entry: AddressBookEntry) => {
            const addressBook = this.store.addressBook;
            addressBook.delete(entry.account);
            this._dispatch({ addressBook });
        });

        UPDATE_ADDRESS_BOOK.subscribe((entry: AddressBookEntry) => {
            const addressBook = this.store.addressBook;
            if (entry.account === entry.name) {
                addressBook.delete(entry.account);
            } else {
                addressBook.set(entry.account, entry.name);
            }
            this._dispatch({ addressBook });
        });

        REMOVE_ACTIVE_WALLET.subscribe(() => {
            const { activeWallet, localStorageWallets } = this._walletStorageService.removeActiveWallet();
            this._snackbar.open('Removed Wallet', SNACKBAR_CLOSE_ACTION_TEXT, { duration: SNACKBAR_DURATION });
            this._dispatch({ activeWallet, localStorageWallets });
            if (activeWallet) {
                REFRESH_DASHBOARD_ACCOUNTS.next();
            } else {
                this._dispatch({
                    hasSecret: false,
                    hasUnlockedLedger: false,
                    hasUnlockedSecret: false,
                    walletPassword: undefined,
                });
            }
        });

        REMOVE_ALL_WALLET_DATA.subscribe(() => {
            this._walletStorageService.clearLocalStorage();
            this._snackbar.open('All Wallets Removed!', SNACKBAR_CLOSE_ACTION_TEXT, { duration: SNACKBAR_DURATION });
            this._dispatch({
                hasSecret: false,
                localStorageWallets: [],
                activeWallet: undefined,
                addressBook: new Map(),
            });
            LOCK_WALLET.next();
        });

        REQUEST_BACKUP_SECRET.subscribe(async (data) => {
            if (data.useMnemonic) {
                const mnemonic = await this._secretService.getActiveWalletMnemonic();
                COPY_MNEMONIC_TO_CLIPBOARD.next({ mnemonic, openSnackbar: true });
            } else {
                const seed = await this._secretService.getActiveWalletSeed();
                COPY_SEED_TO_CLIPBOARD.next({ seed, openSnackbar: true });
            }
        });

        SET_DASHBOARD_ACCOUNT_LOADING.subscribe((isLoadingAccounts) => {
            this._dispatch({ isLoadingAccounts });
        });

        SELECT_LOCALIZATION_CURRENCY.subscribe(async (localCurrencyCode: string) => {
            const priceDataUSD = await this._spyglassService.getBananoPriceRelativeToBitcoin();
            const localCurrencyConversionRate = await this._currencyConversionService.convertToUSD(localCurrencyCode);
            this._dispatch({ localCurrencyCode, localCurrencyConversionRate, priceDataUSD });
        });

        UNLOCK_WALLET.subscribe((data) => {
            this._dispatch({
                activeWallet: this._walletStorageService.readActiveWalletFromLocalStorage(),
                hasUnlockedSecret: !data.isLedger,
                hasUnlockedLedger: data.isLedger,
                walletPassword: data.password,
            });

            void this._accountService.fetchOnlineRepresentatives().then((onlineRepresentatives) => {
                this._appStateService.onlineRepresentatives = onlineRepresentatives;
            });
            void this._accountService.fetchKnownAccounts().then((knownAccounts) => {
                this._appStateService.knownAccounts = knownAccounts;
            });
            REFRESH_DASHBOARD_ACCOUNTS.next();
        });
    }

    /** Broadcasts an updated app state. */
    private _dispatch(newData: Partial<AppStore>): void {
        this._appStateService.store.next(Object.assign(this._appStateService.store.getValue(), newData));

        /* appLocalStorage events are only emitted when we need to write to localstorage; see `wallet-storage.service`. */
        if (newData.activeWallet || newData.localStorageWallets || newData.addressBook || newData.localCurrencyCode) {
            this._appStateService.appLocalStorage.next({
                localizationCurrencyCode: newData.localCurrencyCode,
                addressBook: newData.addressBook,
                activeWallet: newData.activeWallet,
                localStorageWallets: newData.localStorageWallets,
            });
        }
    }
}
