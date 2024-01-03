import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmedTxDataSource, ReceivableTxDataSource } from '@app/pages/account/datasource';
import { UtilService } from '@app/services/util.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { AccountService } from '@app/services/account.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { ThemeService } from '@app/services/theme.service';
import { RpcService } from '@app/services/rpc.service';
import { ViewportService } from '@app/services/viewport.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FilterBottomSheetComponent } from '@app/overlays/bottom-sheet/filter/filter-bottom-sheet.component';
import { FilterOverlayData } from '@app/overlays/actions/filter/filter.component';
import { ReceiveBottomSheetComponent } from '@app/overlays/bottom-sheet/receive/receive-bottom-sheet.component';
import { ReceiveDialogComponent } from '@app/overlays/dialogs/receive/receive-dialog.component';
import { FilterDialogComponent } from '@app/overlays/dialogs/filter/filter-dialog.component';
import { SendBottomSheetComponent } from '@app/overlays/bottom-sheet/send/send-bottom-sheet.component';
import { SendDialogComponent } from '@app/overlays/dialogs/send/send-dialog.component';
import { ChangeRepBottomSheetComponent } from '@app/overlays/bottom-sheet/change-rep/change-rep-bottom-sheet.component';
import { ChangeRepDialogComponent } from '@app/overlays/dialogs/change-rep/change-rep-dialog.component';
import {
    COPY_ADDRESS_TO_CLIPBOARD,
    REFRESH_SPECIFIC_ACCOUNT_BY_INDEX,
    TRANSACTION_COMPLETED_SUCCESS,
} from '@app/services/wallet-events.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SendOverlayData } from '@app/overlays/actions/send/send.component';
import { ReceiveOverlayData } from '@app/overlays/actions/receive/receive.component';

@UntilDestroy()
@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AccountComponent implements OnInit, OnDestroy {
    store: AppStore;
    ds: ConfirmedTxDataSource;
    re_ds: ReceivableTxDataSource;
    account: AccountOverview;

    filterData: FilterOverlayData = {
        includeReceive: true,
        includeSend: true,
        includeChange: true,
        minAmount: undefined,
        maxAmount: undefined,
        filterAddresses: '',
    };

    // This is set on page load using route.
    address: string;
    accountHeight: number;

    isAccountActionsMobileMenuOpen = false;
    unopenedAccount = false;
    isLoadingHeight = false;
    warnBannerDismissed = false;
    hideTransactionFilters = false;
    hasCopiedAccountAddress = false;
    receivableExpand = false;

    bottomSheetDismissDelayMs = 100;
    containerHeightClass = 'disable-contained-height';

    constructor(
        public util: UtilService,
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _ref: ChangeDetectorRef,
        private readonly _rpcService: RpcService,
        private readonly _themeService: ThemeService,
        private readonly _accountService: AccountService,
        private readonly _spyglassService: SpyglassService,
        private readonly _appStateService: AppStateService
    ) {
        this._appStateService.store.pipe(untilDestroyed(this)).subscribe((store) => {
            this.store = store;
            store.accounts.forEach((account) => {
                if (account.fullAddress === this.address) {
                    this.account = account;
                }
            });
        });

        // TODO: This might be better placed in the wallet actions.
        TRANSACTION_COMPLETED_SUCCESS.pipe(untilDestroyed(this)).subscribe(() => {
            this.refreshCurrentAccountInfo();
        });
    }

    ngOnInit(): void {
        this.address = window.location.pathname.split('/').pop();
        this._setAccount();
        this._searchAccountTxHistory();
    }

    ngOnDestroy(): void {
        this._disconnectDatasource(true);
        this._enableContainerHeightRestrictions();
    }

    private _adjustContainerHeightSettings(): void {
        if (this.isRepOffline()) {
            this._ignoreContainerHeightRestrictions();
        }
    }

    /** Called whenever a user wants to hide the Representative Offline message at the top of the screen. */
    dismissRepOfflineBanner(): void {
        this.warnBannerDismissed = true;
        this._enableContainerHeightRestrictions();
    }

    /** Go back to dashboard. */
    goHome(): void {
        void this._router.navigate(['/']);
    }

    getMonkeyUrl(): string {
        return this._accountService.createMonKeyUrl(this.address);
    }

    /** Iterates through each pending transaction block and receives them. */
    receive(): void {
        const blocks = [];
        for (const block of this.account.pending) {
            blocks.push({
                hash: block.hash,
                receivableRaw: block.receivableRaw,
                index: this.account.index,
            });
        }
        const data: ReceiveOverlayData = { blocks: blocks };
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(ReceiveBottomSheetComponent, { data });
            }, this.bottomSheetDismissDelayMs);
        } else {
            this._dialog.open(ReceiveDialogComponent, { data });
        }
    }

    /** Opens dialog to send funds. */
    send(): void {
        const overlayData: { data: SendOverlayData } = {
            data: {
                address: this.account.fullAddress,
                maxSendAmount: this.account.balance,
                index: this.account.index,
                maxSendAmountRaw: this.account.balanceRaw,
                localCurrencySymbol: this.store.localCurrencyCode,
            },
        };
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(SendBottomSheetComponent, overlayData);
            }, this.bottomSheetDismissDelayMs);
        } else {
            this._dialog.open(SendDialogComponent, overlayData);
        }
    }

    /** Opens dialog to change account representative. */
    changeRep(): void {
        this.isAccountActionsMobileMenuOpen = false;
        const overlayData = {
            data: {
                address: this.account.fullAddress,
                currentRep: this.account.representative,
                index: this.account.index,
            },
        };
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(ChangeRepBottomSheetComponent, overlayData);
            }, this.bottomSheetDismissDelayMs);
        } else {
            this._dialog.open(ChangeRepDialogComponent, overlayData);
        }
    }

    openFilterDialog(): void {
        this.isAccountActionsMobileMenuOpen = false;
        const overlayData = {
            data: this.filterData,
        };
        const postFilterActions = (data: FilterOverlayData): void => {
            if (data.update) {
                this.filterData = data;
                this.createNewDataSource();
            }
        };

        if (this.vp.sm) {
            setTimeout(() => {
                const ref = this._sheet.open(FilterBottomSheetComponent, overlayData);
                ref.afterDismissed().subscribe((hash) => postFilterActions(hash));
            }, this.bottomSheetDismissDelayMs);
        } else {
            const ref = this._dialog.open(FilterDialogComponent, overlayData);
            ref.afterClosed().subscribe((hash) => postFilterActions(hash));
        }
    }

    /** Using data from the dashboard, sets the account */
    // TODO, reevaluate this.
    private _setAccount(): void {
        this._appStateService.store.getValue().accounts.map((account) => {
            if (this.address === account.fullAddress) {
                this.account = account;
                this._adjustContainerHeightSettings();
                this._ref.detectChanges();
            }
        });
    }

    /**
     * Fetches block count, account insights & recreates transaction datasource.
     * Called on page load &
     * Called whenever a user finishes a send, receive, or change workflow.
     * */
    private _searchAccountTxHistory(): void {
        this.isLoadingHeight = true;
        void this._rpcService
            .getAccountHeight(this.address)
            .then((height) => {
                this.accountHeight = height;
                this.hideTransactionFilters = height >= 100_000 || height === 0;
                this.isLoadingHeight = false;
                this.createNewDataSource();
            })
            .catch((err) => {
                console.error(err);
                if (err && err.error === 'Account not found') {
                    this.unopenedAccount = true;
                    this.hideTransactionFilters = true;
                }
                this.isLoadingHeight = false;
            });
    }

    /** Creates a new datasource, taking into account any transaction filters. */
    createNewDataSource(): void {
        this._disconnectDatasource();
        this.ds = new ConfirmedTxDataSource(
            this.address,
            this.accountHeight,
            this._spyglassService,
            this._ref,
            this.util,
            this.filterData,
            this.isFilterApplied()
        );
        this.re_ds = new ReceivableTxDataSource(this.address, this._spyglassService, this._ref, this.util);
        this._ref.detectChanges();
    }

    /** Considering filters, returns the max number of transactions that can appear.
     *  Used to create placeholder 'loading' array and determine height of scroll container. */
    countTotalDisplayableTxCount(): number {
        if (this.isFilterApplied()) {
            if (this.ds) {
                return this.ds._cachedData.length;
            }
            return 210;
        }
        return this.accountHeight;
    }

    /** Disconnects datasource if it exists. */
    private _disconnectDatasource(isDestroyed = false): void {
        if (this.ds) {
            this.ds.disconnect();
            this.ds = undefined;

            // Do not run change detection when the component is destroyed; this ruins the angular scroll animation.
            if (!isDestroyed) {
                this._ref.detectChanges();
            }
        }
        if (this.re_ds) {
            this.re_ds.disconnect();
            this.re_ds = undefined;

            if (!isDestroyed) {
                this._ref.detectChanges();
            }
        }
    }

    isRepOffline(): boolean {
        return !this._accountService.isRepOnline(this.account?.representative);
    }

    copyAccountAddressDesktop(): void {
        this.util.clipboardCopy(this.address);
        this.hasCopiedAccountAddress = true;
        setTimeout(() => {
            this.hasCopiedAccountAddress = false;
        }, 700);
    }

    copyAccountAddressMobile(): void {
        COPY_ADDRESS_TO_CLIPBOARD.next({ address: this.address });
        this.isAccountActionsMobileMenuOpen = false;
    }

    /** Hard Refresh for all information known about this account.
     *  Fetches blockcount, account info, pending blocks, insights & then confirmed tx. */
    refreshCurrentAccountInfo(): void {
        this.unopenedAccount = false;
        this.isAccountActionsMobileMenuOpen = false;
        this._disconnectDatasource();
        if (this.isLoadingHeight) {
            return;
        }
        this._searchAccountTxHistory();
        REFRESH_SPECIFIC_ACCOUNT_BY_INDEX.next(this.account.index);
    }

    isFilterApplied(): boolean {
        return Boolean(
            !this.filterData.includeChange ||
                !this.filterData.includeSend ||
                !this.filterData.includeReceive ||
                this.filterData.maxAmount ||
                this.filterData.minAmount ||
                this.filterData.filterAddresses
        );
    }

    /** If these numbers need adjusted, see the `account.component.scss` file since there are styles there that need to match. */
    getTransactionRowHeight(): number {
        return this.vp.sm ? 72 : 52;
    }

    /** Screen height & transaction container height is normally fixed height since we know the height of all elements... except Rep is Offline banner.
     * To prevent the banner content from being overflowed, this method and class disables the full screen height restrictions.
     * When the banner is dismissed, normal height restrictions are re-enabled.
     * This means that whenever the Rep Offline Banner is present on the screen, some of the height calculations aren't 100% accurate anymore.
     * This is a bug but I can live with it.  */
    private _ignoreContainerHeightRestrictions(): void {
        document.documentElement.classList.add(this.containerHeightClass);
        document.body.classList.add(this.containerHeightClass);
    }

    private _enableContainerHeightRestrictions(): void {
        document.documentElement.classList.remove(this.containerHeightClass);
        document.body.classList.remove(this.containerHeightClass);
    }

    showProgressBar(): boolean {
        return (
            this.isLoadingHeight || (this.ds && !this.ds.firstPageLoaded) || (this.re_ds && !this.re_ds.firstPageLoaded)
        );
    }

    showNoFilteredResultsEmptyState(): boolean {
        return this.isFilterApplied() && this.ds && this.ds.firstPageLoaded && this.ds._cachedData.length === 0;
    }

    getScrollContainerHeight(): number {
        return this.countTotalDisplayableTxCount() * this.getTransactionRowHeight() + (this.vp.sm ? 16 : 0); // Account for vert padding on mobile devices.
    }

    getScrollContainerHeightReceivable(): number {
        const containerHeight = this.re_ds._cachedData.length * this.getTransactionRowHeight() + (this.vp.sm ? 16 : 0); // Account for vert padding on mobile devices.
        //cap at 1/3rd of the screen height
        return containerHeight > document.body.clientHeight / 2 ? document.body.clientHeight / 3 : containerHeight;
    }

    toggleReceivableExpand(): void {
        this.receivableExpand = !this.receivableExpand;
    }
}
