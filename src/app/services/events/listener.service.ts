import { Injectable } from '@angular/core';
import { SecretService } from '@app/services/secret.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilService } from '@app/services/util.service';
import { LocalStorageWallet, WalletStorageService } from '@app/services/wallet-storage.service';
import { TransactionService } from '@app/services/transaction.service';
import { AccountService } from '@app/services/account.service';

const duration = 3000;
const closeActionText = 'Dismiss';

@Injectable({
    providedIn: 'root',
})
export class ListenerService {
    store: AppStore;

    constructor(
        private readonly _util: UtilService,
        private readonly _snackbar: MatSnackBar,
        private readonly _secretService: SecretService,
        private readonly _accountService: AccountService,
        private readonly _appStateService: AppStateService,
        private readonly _transactionService: TransactionService,
        private readonly _walletEventService: WalletEventsService,
        private readonly _walletStorageService: WalletStorageService
    ) {
        const e = this._walletEventService;

        // Dispatch initial app state
        this.dispatch({
            hasSecret: this._walletStorageService.hasSecretWalletSaved(),
            activeWallet: this._walletStorageService.readActiveWalletFromLocalStorage(),
            localStorageWallets: this._walletStorageService.readWalletsFromLocalStorage(),
        });

        this._appStateService.store.subscribe((store) => {
            this.store = store;
        });

        // Listening for events
        e.attemptUnlockSecretWallet.subscribe(async (data) => {
            try {
                await this._secretService.unlockSecretWallet(data.password);
                e.unlockWallet.next({
                    isLedger: false,
                    password: data.password,
                });
            } catch (err) {
                console.error(err);
                e.passwordIncorrect.next();
            }
        });

        e.unlockWallet.subscribe((data) => {
            this.dispatch({
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

            this._walletEventService.refreshAccountBalances.next();
        });

        e.lockWallet.subscribe(() => {
            this.dispatch({
                hasUnlockedLedger: false,
                hasUnlockedSecret: false,
                walletPassword: undefined,
            });
        });

        e.attemptUnlockLedger.subscribe(async () => {
            try {
                await this._transactionService.checkLedgerOrError();
                this.dispatch({ hasUnlockedLedger: true });
            } catch (err) {
                e.ledgerConnectionError.next({ error: err });
            }
        });

        e.backupSeed.subscribe((data: { seed: string; openSnackbar: boolean }) => {
            this._util.clipboardCopy(data.seed);
            if (data.openSnackbar) {
                this._snackbar.open('Wallet Seed Copied!', closeActionText, { duration });
            }
        });

        e.backupMnemonic.subscribe((data: { mnemonic: string; openSnackbar: boolean }) => {
            this._util.clipboardCopy(data.mnemonic);
            if (data.openSnackbar) {
                this._snackbar.open('Wallet Mnemonic Phrase Copied!', closeActionText, { duration });
            }
        });

        e.copiedAddress.subscribe((data: { address: string }) => {
            this._util.clipboardCopy(data.address);
            if (data.address) {
                this._snackbar.open('Address Copied!', closeActionText, { duration });
            }
        });

        e.removeWallet.subscribe(() => {
            this._snackbar.open('Removed Wallet', closeActionText, { duration });
        });

        e.clearLocalStorage.subscribe(() => {
            localStorage.clear();
            this._snackbar.open('All Wallets Removed!', closeActionText, { duration });
            this._walletEventService.lockWallet.next();
        });

        e.accountLoading.subscribe((isLoading) => {
            this.dispatch({ isLoadingAccounts: isLoading });
        });

        e.addSecret.subscribe(async (data): Promise<void> => {
            const password = this.store.hasUnlockedSecret ? this.store.walletPassword : data.password;
            const encryptedSecret = await this._secretService.storeSecret(data.secret, password);
            this.dispatch({
                hasSecret: true,
                hasUnlockedSecret: true,
            });
            const wallet = this._walletStorageService.createLocalStorageWallet(encryptedSecret);
            e.activeWalletChange.next(wallet);
        });

        e.activeWalletChange.subscribe((activeWallet: LocalStorageWallet) => {
            this.dispatch({ activeWallet });
            e.refreshAccountBalances.next();
        });

        e.refreshAccountBalances.subscribe(() => {
            this.dispatch({ accounts: [], isLoadingAccounts: true, totalBalance: 0 });
            const indexes = this.store.activeWallet.loadedIndexes;
            if (indexes.length === 0) {
                indexes.push(0);
            }
            this._walletEventService.addIndexes.next(indexes);
        });

        e.addNextIndex.subscribe(() => {
            const nextIndex = this._accountService.findNextUnloadedIndex();
            this._walletEventService.addIndexes.next([nextIndex]);
        });

        e.addIndexes.subscribe(async (indexes: number[]) => {
            const accounts = this.store.accounts;
            this.dispatch({ isLoadingAccounts: true });
            let totalBalance = this.store.totalBalance;
            for await (const index of indexes) {
                const account = await this._accountService.fetchAccount(index);
                accounts.push(account);
                totalBalance += account.balance;
                this.dispatch({ totalBalance });
            }
            this.dispatch({ accounts, isLoadingAccounts: false });
        });

        e.removeIndexes.subscribe((indexes: number[]) => {
            const accounts = this._accountService.removeAccounts(indexes);
            this.dispatch({ accounts });
        });
    }

    /** Broadcasts an updated app state. */
    dispatch(newData: Partial<AppStore>): void {
        this._appStateService.store.next(Object.assign(this._appStateService.store.getValue(), newData));
    }
}
