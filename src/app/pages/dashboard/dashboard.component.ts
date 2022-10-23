import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { Router } from '@angular/router';
import { UtilService } from '@app/services/util.service';
import { AccountService } from '@app/services/account.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ViewportService } from '@app/services/viewport.service';
import { ThemeService } from '@app/services/theme.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AddIndexDialogComponent } from '@app/overlays/dialogs/add-index/add-index-dialog.component';
import { AddIndexBottomSheetComponent } from '@app/overlays/bottom-sheet/add-index/add-index-bottom-sheet.component';
import { EnterSecretBottomSheetComponent } from '@app/overlays/bottom-sheet/enter-secret/enter-secret-bottom-sheet.component';
import { EnterSecretDialogComponent } from '@app/overlays/dialogs/enter-secret/enter-secret-dialog.component';
import { LocalStorageWallet, WalletStorageService } from '@app/services/wallet-storage.service';
import { Subscription } from 'rxjs';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { RenameWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-wallet/rename-wallet-bottom-sheet.component';
import { RenameWalletDialogComponent } from '@app/overlays/dialogs/rename-wallet/rename-wallet-dialog.component';
import { SecretService } from '@app/services/secret.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
    colors = Colors;

    hasHideAccountToggle = false;
    isLoadingAccount = true;
    accountActionsOverlayOpen = false;
    walletActionsOverlayOpen = false;
    switchWalletOverlayOpen = false;
    hoverRowNumber: number;

    selectedItems: Set<number> = new Set();

    loadingAccountListener: Subscription;
    bottomSheetOpenDelayMs = 250;

    constructor(
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _util: UtilService,
        private readonly _sheet: MatBottomSheet,
        private readonly _themeService: ThemeService,
        private readonly _secretService: SecretService,
        private readonly _accountService: AccountService,
        private readonly _walletStorageService: WalletStorageService,
        private readonly _walletEventsService: WalletEventsService,
        public vp: ViewportService
    ) {}

    ngOnInit(): void {
        // Initial Load
        this.isLoadingAccount = this.getAccounts().length === 0;
        this.loadingAccountListener = this._walletEventsService.accountLoading.subscribe((loading) => {
            setTimeout(() => {
                this.isLoadingAccount = loading;
            });
        });
    }

    ngOnDestroy(): void {
        if (this.loadingAccountListener) {
            this.loadingAccountListener.unsubscribe();
        }
    }

    /** Wallet Actions [START] */
    openEnterSeedOverlay(): void {
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(EnterSecretBottomSheetComponent);
            }, this.bottomSheetOpenDelayMs);
        } else {
            this._dialog.open(EnterSecretDialogComponent);
        }
        this.walletActionsOverlayOpen = false;
    }

    openRenameWalletOverlay(): void {
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(RenameWalletBottomSheetComponent);
            }, this.bottomSheetOpenDelayMs);
        } else {
            this._dialog.open(RenameWalletDialogComponent);
        }
        this.walletActionsOverlayOpen = false;
    }

    removeWallet(): void {
        this.walletActionsOverlayOpen = false;
        // Wait a moment to dismiss the menu before deleting wallet.
        setTimeout(() => {
            this._walletEventsService.removeWallet.next();
        }, 100);
    }

    copyWalletSeed(): void {
        const activeWalletId = this._walletStorageService.getActiveWalletId();
        void this._secretService.backupWalletSecret(activeWalletId);
        this.walletActionsOverlayOpen = false;
    }

    copyWalletMnemonic(): void {
        const activeWalletId = this._walletStorageService.getActiveWalletId();
        void this._secretService.backupWalletMnemonic(activeWalletId);
        this.walletActionsOverlayOpen = false;
    }
    /** Wallet Actions [END] */

    /** Account Actions [START] **/
    refresh(): void {
        this._walletEventsService.refreshIndexes.next();
        this.isLoadingAccount = true;
        this.accountActionsOverlayOpen = false;
    }

    addAccount(): void {
        if (this.isLoadingAccount) {
            return;
        }
        const nextIndex = this._accountService.findNextUnloadedIndex();
        this._walletEventsService.addIndex.next(nextIndex);
        this.accountActionsOverlayOpen = false;
    }

    addAccountFromIndex(): void {
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(AddIndexBottomSheetComponent);
            }, this.bottomSheetOpenDelayMs);
        } else {
            this._dialog.open(AddIndexDialogComponent);
        }
        this.accountActionsOverlayOpen = false;
    }
    /** Account Actions [END] **/

    isDark(): boolean {
        return this._themeService.isDark();
    }

    getMonkeyUrl(address: string): string {
        return this._accountService.createMonKeyUrl(address);
    }

    getActiveWallet(): LocalStorageWallet {
        return this._walletStorageService.activeWallet;
    }

    getWallets(): LocalStorageWallet[] {
        return this._walletStorageService.wallets;
    }

    hasAlternativeWallets(): boolean {
        return this._walletStorageService.wallets && this._walletStorageService.wallets.length >= 2;
    }

    showRepresentativeOffline(address: string): boolean {
        return !this._accountService.isRepOnline(address);
    }

    formatRepresentative(rep: string): string {
        return this._accountService.repAliases.get(rep) || this._util.shortenAddress(rep);
    }

    openAccount(address: string): void {
        void this._router.navigate([`/${address}`]);
    }

    getBalance(): string {
        return this._accountService.totalBalance || '--';
    }

    getAccounts(): AccountOverview[] {
        return this._accountService.accounts;
    }

    toggleSelectAccounts(): void {
        this.hasHideAccountToggle = !this.hasHideAccountToggle;
        this.accountActionsOverlayOpen = false;
        this.selectedItems.clear();
    }

    hideSelected(): void {
        for (const index of Array.from(this.selectedItems.values())) {
            this._walletEventsService.removeIndex.next(index);
        }
        this.selectedItems.clear();
    }

    toggleAll(e: MatCheckboxChange): void {
        if (e.checked) {
            this.getAccounts().map((account) => {
                this.selectedItems.add(account.index);
            });
        } else {
            this.selectedItems.clear();
        }
    }

    toggleCheck(e: MatCheckboxChange, account: AccountOverview): void {
        if (e.checked) {
            this.selectedItems.add(account.index);
        } else {
            this.selectedItems.delete(account.index);
        }
    }

    changeActiveWallet(wallet: LocalStorageWallet): void {
        this._walletEventsService.activeWalletChange.next(wallet);
        this.switchWalletOverlayOpen = false;
    }

    getItemBackgroundColor(even: boolean): string {
        return even
            ? this.isDark()
                ? this.colors.darkBlack[300]
                : this.colors.white[100]
            : this.isDark()
            ? this.colors.darkBlack[200]
            : this.colors.white[50];
    }

    isLedgerDevice(): boolean {
        return this._secretService.isLocalLedgerUnlocked();
    }
}
