import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';

@Injectable({
    providedIn: 'root',
})
export class WalletEventsService {
    walletUnlocked = new Subject<void>();
    walletLocked = new Subject<void>();
    addWallet = new Subject<LocalStorageWallet>();
    activeWalletChange = new Subject<LocalStorageWallet>();
    addIndex = new Subject<number>();
    removeIndex = new Subject<number>();
    accountLoading = new Subject<boolean>();
    refreshIndexes = new Subject<void>();
    removeWallet = new Subject<void>();
    renameWallet = new Subject<string>();
}
