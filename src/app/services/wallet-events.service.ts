import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';

@Injectable({
    providedIn: 'root',
})
export class WalletEventsService {
    /** A wallet (either secret or ledger) has been unlocked. */
    walletUnlocked = new Subject<{ isLedger: boolean }>();

    /** A wallet (previously unlocked) has been effectively logged out with no remaining secrets known. */
    walletLocked = new Subject<void>();

    /** A new secret has been provided */
    addSecret = new Subject<{ secret: string; password: string }>();

    /** A new encrypted wallet has been created. */
    addWallet = new Subject<LocalStorageWallet>();

    /** The actively displayed wallet on the dashboard has changed. */
    activeWalletChange = new Subject<LocalStorageWallet>();

    /** A new address (index) has been added to the dashboard. */
    addIndex = new Subject<number>();

    /** New addresses (index) has been added to the dashboard. */
    addIndexes = new Subject<number[]>();

    /** An address (index) has been removed from the dashboard. */
    removeIndex = new Subject<number>();

    /** An account is being added to the dashboard. Can be either true or false. */
    accountLoading = new Subject<boolean>();

    /** User has requested that all loaded indexes be refreshed, checking for receivable transactions and updating account balances. */
    refreshIndexes = new Subject<void>();

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
}
