import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyDataSource } from '@app/pages/account/datasource';
import { UtilService } from '@app/services/util.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { AccountService } from '@app/services/account.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { ThemeService } from '@app/services/theme.service';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
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
import { COPY_ADDRESS_TO_CLIPBOARD, REFRESH_SPECIFIC_ACCOUNT_BY_INDEX } from '@app/services/wallet-events.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
    colors = Colors;
    store: AppStore;
    ds: MyDataSource;
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

    /** Open link in an explorer, defaults to YellowSpyglass. */
    openLink(hash: string): void {
        this._accountService.showBlockInExplorer(hash);
    }

    /** Shows alias (if exists) or shortened address. */
    formatAddress(address: string): string {
        return this._appStateService.knownAccounts.get(address) || this.util.shortenAddress(address);
    }

    /** Iterates through each pending transaction block and receives them. */
    receive(): void {
        const overlayData = {
            data: {
                address: this.account.fullAddress,
                blocks: this.account.pending,
                index: this.account.index,
            },
        };
        if (this.vp.sm) {
            setTimeout(() => {
                const ref = this._sheet.open(ReceiveBottomSheetComponent, overlayData);
                ref.afterDismissed().subscribe((hash) => this._postOverlayActions(hash));
            }, this.bottomSheetDismissDelayMs);
        } else {
            const ref = this._dialog.open(ReceiveDialogComponent, overlayData);
            ref.afterClosed().subscribe((hash) => this._postOverlayActions(hash));
        }
    }

    /** Opens dialog to send funds. */
    send(): void {
        const overlayData = {
            data: {
                address: this.account.fullAddress,
                maxSendAmount: this.account.balance,
                index: this.account.index,
            },
        };
        if (this.vp.sm) {
            setTimeout(() => {
                const ref = this._sheet.open(SendBottomSheetComponent, overlayData);
                ref.afterDismissed().subscribe((hash) => this._postOverlayActions(hash));
            }, this.bottomSheetDismissDelayMs);
        } else {
            const ref = this._dialog.open(SendDialogComponent, overlayData);
            ref.afterClosed().subscribe((hash) => this._postOverlayActions(hash));
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
                const ref = this._sheet.open(ChangeRepBottomSheetComponent, overlayData);
                ref.afterDismissed().subscribe((hash) => this._postOverlayActions(hash));
            }, this.bottomSheetDismissDelayMs);
        } else {
            const ref = this._dialog.open(ChangeRepDialogComponent, overlayData);
            ref.afterClosed().subscribe((hash) => this._postOverlayActions(hash));
        }
    }

    /** Call this after an overlay is dismissed.  Will refresh data if a new transaction has been broadcasted. */
    private _postOverlayActions(hash?: string): void {
        if (!hash) {
            return;
        }
        this.refreshCurrentAccountInfo();
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
        this.ds = new MyDataSource(
            this.address,
            this.accountHeight,
            this._spyglassService,
            this._ref,
            this.util,
            this.filterData,
            this.isFilterApplied()
        );
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
    }

    isRepOffline(): boolean {
        return !this._accountService.isRepOnline(this.account?.representative);
    }

    /** Opens a link to show why changing rep is important. */
    openChangeRepDocs(): void {
        window.open('https://nanotools.github.io/Change-Nano-Representative/');
    }

    /** Useful for alternating row colors. */
    isDark(): boolean {
        return this._themeService.isDark();
    }

    /** Copies transaction sender, recipient, or new representative to clipboard. */
    copyTransactionAddress(item: ConfirmedTx): void {
        this.util.clipboardCopy(item.address || item.newRepresentative);
        item.showCopiedIcon = true;
        setTimeout(() => {
            item.showCopiedIcon = false;
        }, 700);
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

    /** If these numbers need adjusted, see the `account.component.scss` file since there are styles there that need to match. */
    getTransactionRowHeight(): number {
        return this.vp.sm ? 72 : 52;
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
        return this.isLoadingHeight || (this.ds && !this.ds.firstPageLoaded);
    }

    showNoFilteredResultsEmptyState(): boolean {
        return this.isFilterApplied() && this.ds && this.ds.firstPageLoaded && this.ds._cachedData.length === 0;
    }
}
