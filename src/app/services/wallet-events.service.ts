import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';

@Injectable({
    providedIn: 'root',
})
export class WalletEventsService {
    /** User has attempted to unlock an encrypted secret wallet using a password. */
    attemptUnlockSecretWallet = new Subject<{ password: string }>();

    /** User has provided an incorrect password to unlock the wallet. */
    passwordIncorrect = new Subject<void>();

    /** A wallet (either secret or ledger) has been unlocked. */
    unlockWallet = new Subject<{ isLedger: boolean; password: string }>();

    /** A wallet (previously unlocked) has been effectively logged out with no remaining secrets known. */
    lockWallet = new Subject<void>();

    /** A new secret has been provided, can be either a seed or mnemonic. */
    addSecret = new Subject<{ secret: string; password: string }>();

    /** A new encrypted wallet has been created. */
    addWallet = new Subject<LocalStorageWallet>();

    /** The actively displayed wallet on the dashboard has changed. */
    activeWalletChange = new Subject<LocalStorageWallet>();

    /** New addresses (index) has been added to the dashboard. */
    addIndexes = new Subject<number[]>();

    /** An address (index) has been removed from the dashboard. */
    removeIndex = new Subject<number>();

    /** An account is being added to the dashboard. Can be either true or false. */
    accountLoading = new BehaviorSubject<boolean>(true);

    /** User has requested that all loaded indexes be refreshed, checking for receivable transactions and updating account balances. */
    refreshAccountBalances = new Subject<void>();

    /** The active wallet has been removed. */
    removeWallet = new Subject<void>();

    /** The active wallet has been given an alias. */
    renameWallet = new Subject<string>();

    /** Update active wallet password */
    reencryptWalletSecret = new Subject<LocalStorageWallet>();

    /** Backup active wallet seed to clipboard  */
    backupSeed = new Subject<{ seed: string; openSnackbar: boolean }>();

    /** Backup active wallet Mnemonic Phrase to clipboard */
    backupMnemonic = new Subject<{ mnemonic: string; openSnackbar: boolean }>();

    /** User has copied account address to clipboard. */
    copiedAddress = new Subject<{ address: string }>();

    /** User has opted to delete all locally stored info. */
    clearLocalStorage = new Subject<void>();

    /** User has generated a new seed & mnenomic. */
    requestGenerateNewSecret = new Subject<void>();

    /** User wants to unlock the ledger device. */
    attemptUnlockLedger = new Subject<void>();

    /** Oopsies */
    ledgerConnectionError = new Subject<{ error: string }>();
}
