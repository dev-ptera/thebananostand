import { Injectable } from '@angular/core';
import { SecretService } from '@app/services/secret.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilService } from '@app/services/util.service';
import { WalletStorageService } from '@app/services/wallet-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TransactionService } from '@app/services/transaction.service';

const duration = 3000;
const closeActionText = 'Dismiss';

@Injectable({
    providedIn: 'root',
})
export class ListenerService {
    constructor(
        private readonly _secretService: SecretService,
        private readonly _walletEventService: WalletEventsService,
        private readonly _walletStorageService: WalletStorageService,
        private readonly _appStateService: AppStateService,
        private readonly _transactionService: TransactionService,
        private readonly _snackbar: MatSnackBar,
        private readonly _util: UtilService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet
    ) {
        this._emitUpdatedStore({ hasSecret: this._walletStorageService.hasLocalStorageSecretWallet() });
        this._listenAuthorizationActions(_walletEventService);
        this._listenClipboardContentCopyActions(_walletEventService);
        this._listenRemoveWalletActions(_walletEventService);
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
                .then((results) => {
                    e.unlockWallet.next({
                        isLedger: results.isLedger,
                        password: data.password,
                    });
                })
                .catch((err) => {
                    console.error(err);
                    e.passwordIncorrect.next();
                });
        });

        e.unlockWallet.subscribe((data) => {
            this._emitUpdatedStore({
                hasUnlockedSecret: !data.isLedger,
                hasUnlockedLedger: data.isLedger,
                walletPassword: data.password,
            });
        });

        e.lockWallet.subscribe(() => {
            this._emitUpdatedStore({
                hasUnlockedLedger: false,
                hasUnlockedSecret: false,
                walletPassword: undefined,
            });
        });

        e.attemptUnlockLedger.subscribe(() => {
            this._transactionService
                .checkLedgerOrError()
                .then(() => {
                    this._secretService.setLocalLedgerUnlocked(true);
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
    private _emitUpdatedStore(newData: Partial<AppStore>): void {
        this._appStateService.store.next(Object.assign(this._appStateService.store.getValue(), newData));
    }
}
