import { Component } from '@angular/core';
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
import {
    CHANGE_ACTIVE_WALLET,
    ADD_NEXT_ACCOUNT_BY_INDEX,
    REFRESH_DASHBOARD_ACCOUNTS,
    REMOVE_ACCOUNTS_BY_INDEX,
    REMOVE_ACTIVE_WALLET,
} from '@app/services/wallet-events.service';
import { RenameWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-wallet/rename-wallet-bottom-sheet.component';
import { RenameWalletDialogComponent } from '@app/overlays/dialogs/rename-wallet/rename-wallet-dialog.component';
import { SecretService } from '@app/services/secret.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
    colors = Colors;

    hasHideAccountToggle = false;
    accountActionsOverlayOpen = false;
    walletActionsOverlayOpen = false;
    switchWalletOverlayOpen = false;
    hoverRowNumber: number;

    selectedItems: Set<number> = new Set();

    bottomSheetOpenDelayMs = 250;

    store: AppStore;

    totalBalance = '--';

    constructor(
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _util: UtilService,
        private readonly _appStateService: AppStateService,
        private readonly _sheet: MatBottomSheet,
        private readonly _themeService: ThemeService,
        private readonly _secretService: SecretService,
        private readonly _accountService: AccountService,
        private readonly _walletStorageService: WalletStorageService,
        public vp: ViewportService
    ) {
        this._appStateService.store.pipe(untilDestroyed(this)).subscribe((store) => {
            this.store = store;
            this.totalBalance = store.totalBalance ? this._util.numberWithCommas(store.totalBalance) : '--';
        });
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
            REMOVE_ACTIVE_WALLET.next();
        }, 100);
    }

    // TODO, emit event.
    copyWalletSeed(): void {
        void this._secretService.backupWalletSecret();
        this.walletActionsOverlayOpen = false;
    }

    // TODO, emit event.
    copyWalletMnemonic(): void {
        void this._secretService.backupWalletMnemonic();
        this.walletActionsOverlayOpen = false;
    }
    /** Wallet Actions [END] */

    /** Account Actions [START] **/
    refresh(): void {
        REFRESH_DASHBOARD_ACCOUNTS.next();
        this.accountActionsOverlayOpen = false;
    }

    addAccount(): void {
        if (this.store.isLoadingAccounts) {
            return;
        }
        ADD_NEXT_ACCOUNT_BY_INDEX.next();
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
        return this.store.activeWallet;
    }

    getWallets(): LocalStorageWallet[] {
        return this.store.localStorageWallets;
    }

    hasAlternativeWallets(): boolean {
        return this.store.localStorageWallets.length >= 2;
    }

    showRepresentativeOffline(address: string): boolean {
        return !this._accountService.isRepOnline(address);
    }

    formatRepresentative(rep: string): string {
        return this._appStateService.knownAccounts.get(rep) || this._util.shortenAddress(rep);
    }

    openAccount(address: string): void {
        void this._router.navigate([`/account/${address}`]);
    }

    getAccounts(): AccountOverview[] {
        return this._appStateService.store.getValue().accounts;
    }

    markUniqueAccount(index: number, item: AccountOverview): any {
        return item.shortAddress;
    }

    toggleSelectAccounts(): void {
        this.hasHideAccountToggle = !this.hasHideAccountToggle;
        this.accountActionsOverlayOpen = false;
        this.selectedItems.clear();
    }

    hideSelected(): void {
        REMOVE_ACCOUNTS_BY_INDEX.next(Array.from(this.selectedItems.values()));
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
        CHANGE_ACTIVE_WALLET.next(wallet);
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
        return this._appStateService.store.getValue().hasUnlockedLedger;
    }
}
