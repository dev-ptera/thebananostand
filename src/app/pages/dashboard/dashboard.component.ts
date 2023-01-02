import { Component } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { Router } from '@angular/router';
import { UtilService } from '@app/services/util.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewportService } from '@app/services/viewport.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AddIndexDialogComponent } from '@app/overlays/dialogs/add-index/add-index-dialog.component';
import { AddIndexBottomSheetComponent } from '@app/overlays/bottom-sheet/add-index/add-index-bottom-sheet.component';
import { EnterSecretBottomSheetComponent } from '@app/overlays/bottom-sheet/enter-secret/enter-secret-bottom-sheet.component';
import { EnterSecretDialogComponent } from '@app/overlays/dialogs/enter-secret/enter-secret-dialog.component';
import { LocalStorageWallet } from '@app/services/wallet-storage.service';
import {
    ADD_NEXT_ACCOUNT_BY_INDEX,
    CHANGE_ACTIVE_WALLET,
    REFRESH_DASHBOARD_ACCOUNTS,
    REMOVE_ACTIVE_WALLET,
    REQUEST_BACKUP_SECRET,
} from '@app/services/wallet-events.service';
import { RenameWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-wallet/rename-wallet-bottom-sheet.component';
import { RenameWalletDialogComponent } from '@app/overlays/dialogs/rename-wallet/rename-wallet-dialog.component';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { hoverDashboardActions } from '../../animation';

@UntilDestroy()
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [hoverDashboardActions],
})
export class DashboardComponent {
    hasHideAccountToggle = false;
    switchWalletOverlayOpen = false;
    walletActionsOverlayOpen = false;
    accountActionsOverlayOpen = false;
    sortDirection: 'none' | 'asc' | 'desc' = 'none';

    store: AppStore;
    colors = Colors;
    selectedItems: Set<number> = new Set();

    bottomSheetOpenDelayMs = 250;

    totalBalance = '--';

    constructor(
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _util: UtilService,
        private readonly _sheet: MatBottomSheet,
        private readonly _appStateService: AppStateService
    ) {
        this._appStateService.store.pipe(untilDestroyed(this)).subscribe((store) => {
            this.store = store;
            if (store.totalBalance === undefined) {
                this.totalBalance = '--';
            } else {
                this.totalBalance = this._util.numberWithCommas(store.totalBalance);
            }
        });
    }

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

    copyWalletSeed(): void {
        REQUEST_BACKUP_SECRET.next({ useMnemonic: false });
        this.walletActionsOverlayOpen = false;
    }

    copyWalletMnemonic(): void {
        REQUEST_BACKUP_SECRET.next({ useMnemonic: true });
        this.walletActionsOverlayOpen = false;
    }

    refreshDashboard(): void {
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

    hasAlternativeWallets(): boolean {
        return this.store.localStorageWallets.length >= 2;
    }

    toggleSelectAccounts(): void {
        this.hasHideAccountToggle = !this.hasHideAccountToggle;
        this.accountActionsOverlayOpen = false;
        this.selectedItems.clear();
    }

    changeActiveWallet(wallet: LocalStorageWallet): void {
        CHANGE_ACTIVE_WALLET.next(wallet);
        this.switchWalletOverlayOpen = false;
    }

    isLedgerDevice(): boolean {
        return this._appStateService.store.getValue().hasUnlockedLedger;
    }

    sortAccountsByBalance(): void {
        if (this.sortDirection === 'asc') {
            this.sortDirection = 'none';
        } else if (this.sortDirection === 'desc') {
            this.sortDirection = 'asc';
        } else {
            this.sortDirection = 'desc';
        }

        this.store.accounts.sort((a, b) => {
            if (this.sortDirection === 'none') {
                return a.index > b.index ? 1 : -1;
            }
            if (!a.representative || !b.representative) {
                return 1;
            }

            if (this.sortDirection === 'asc') {
                return a.balance < b.balance ? -1 : 1;
            }
            return a.balance < b.balance ? 1 : -1;
        });
    }

    isShowMultiWalletSelect(): boolean {
        return this.store.localStorageWallets.length > 1 && this.store.hasUnlockedSecret;
    }
}
