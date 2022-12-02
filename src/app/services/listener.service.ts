import {Injectable} from '@angular/core';
import {SecretService} from '@app/services/secret.service';
import {WalletEventsService} from '@app/services/wallet-events.service';
import {AppStateService, AppStore} from '@app/services/app-state.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UtilService} from '@app/services/util.service';
import {LocalStorageWallet, WalletStorageService} from '@app/services/wallet-storage.service';
import {TransactionService} from '@app/services/transaction.service';
import {AccountService} from '@app/services/account.service';

const duration = 3000;
const closeActionText = 'Dismiss';

@Injectable({
    providedIn: 'root',
})
export class ListenerService {

    store: AppStore;

    constructor(
        private readonly _secretService: SecretService,
        private readonly _walletEventService: WalletEventsService,
        private readonly _walletStorageService: WalletStorageService,
        private readonly _appStateService: AppStateService,
        private readonly _accountService: AccountService,
        private readonly _transactionService: TransactionService,
        private readonly _snackbar: MatSnackBar,
        private readonly _util: UtilService,
    ) {
        // Dispatch initial app state
        this._dispatch({
            hasSecret: this._walletStorageService.hasSecretWalletSaved(),
            localStorageWallets: this._walletStorageService.readWalletsFromLocalStorage(),
        });

        this._appStateService.store.subscribe((store) => {
            this.store = store;
        })

        // Listening for events
        this._listenAuthorizationActions(_walletEventService);
        this._listenClipboardContentCopyActions(_walletEventService);
        this._listenRemoveWalletActions(_walletEventService);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this._walletEventService.addSecret.subscribe(async (data): Promise<void>  => {
            const password = this.store.hasUnlockedSecret ? this.store.walletPassword : data.password;
            const encryptedSecret = await this._secretService.storeSecret(data.secret, password);
            this._dispatch({
                hasSecret: true,
                hasUnlockedSecret: true
            });
            const wallet = this._walletStorageService.createLocalStorageWallet(encryptedSecret);
            this._walletEventService.addWallet.next(wallet);
        });

        this._walletEventService.addWallet.subscribe((wallet: LocalStorageWallet) => {
            this._walletStorageService.addWalletLocalStorage(wallet);
            this._dispatch({
                activeWallet: wallet,
            });
            this._walletEventService.activeWalletChange.next(wallet);
        });
    }

    /** User has removed one or more wallets. */
    private _listenRemoveWalletActions(e: WalletEventsService): void {
        e.removeWallet.subscribe(() => {
            this._snackbar.open('Removed Wallet', closeActionText, { duration });
        });

        e.clearLocalStorage.subscribe(() => {
            this._snackbar.open('All Wallets Removed!', closeActionText, { duration });
        });
    }

    /** Attempt Login, Login, Logout. */
    private _listenAuthorizationActions(e: WalletEventsService): void {
        e.attemptUnlockSecretWallet.subscribe((data) => {
            this._secretService
                .unlockSecretWallet(data.password)
                .then(() => {
                    e.unlockWallet.next({
                        isLedger: false,
                        password: data.password,
                    });
                })
                .catch((err) => {
                    console.error(err);
                    e.passwordIncorrect.next();
                });
        });

        e.unlockWallet.subscribe((data) => {
            this._dispatch({
                hasUnlockedSecret: !data.isLedger,
                hasUnlockedLedger: data.isLedger,
                walletPassword: data.password,
            });

            this._accountService.refreshBalances();
            this._accountService.fetchOnlineRepresentatives();
            void this._accountService.fetchRepresentativeAliases().then((repAliases) => {
                this._dispatch({ repAliases });
            })
            this._accountService.fetchKnownAccounts();
        });

        e.lockWallet.subscribe(() => {
            this._dispatch({
                hasUnlockedLedger: false,
                hasUnlockedSecret: false,
                walletPassword: undefined,
            });
        });

        e.attemptUnlockLedger.subscribe(() => {
            this._transactionService
                .checkLedgerOrError()
                .then(() => {
                    this._dispatch({
                        hasUnlockedLedger: true,
                    });
                })
                .catch((err: string) => {
                    // TODO, handle errors in a consistent way?  Reject only Errors?
                    e.ledgerConnectionError.next({ error: err });
                });
        });
    }

    /** User wants to copy content to the clipboard. */
    private _listenClipboardContentCopyActions(e: WalletEventsService): void {
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
    }

    /** Broadcasts an updated app state. */
    private _dispatch(newData: Partial<AppStore>): void {
        this._appStateService.store.next(Object.assign(this._appStateService.store.getValue(), newData));
    }
}
