import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyDataSource } from '@app/pages/account/datasource';
import { ViewportService } from '@app/services/viewport.service';
import { UtilService } from '@app/services/util.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { AccountService } from '@app/services/account.service';
import { SendDialogComponent } from './dialogs/send/send-dialog.component';
import { ChangeRepDialogComponent } from './dialogs/change-rep/change-rep-dialog.component';
import { AccountOverview } from '@app/types/AccountOverview';
import { LedgerService } from '@app/services/ledger.service';
import { ReceiveDialogComponent } from '@app/pages/account/dialogs/receive/receive-dialog.component';
import { ThemeService } from '@app/services/theme.service';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import { AccountInsights } from '@app/types/AccountInsights';
import { RpcService } from '@app/services/rpc.service';
import { environment } from '../../../environments/environment';
import { FilterDialogComponent, FilterDialogData } from '@app/pages/account/dialogs/filter/filter-dialog.component';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
    // This is set on page load using route.
    address: string;

    accountHeight: number;
    warnBannerDismissed = false;
    unopenedAccount = false;

    colors = Colors;
    ds: MyDataSource;
    account: AccountOverview;
    insights: AccountInsights;

    hideTransactionFilters: boolean;
    isLoadingHeight = false;

    filterData: FilterDialogData = {
        includeReceive: true,
        includeSend: true,
        includeChange: true,
        minAmount: undefined,
        maxAmount: undefined,
        filterAddresses: '',
    };

    constructor(
        public util: UtilService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _ref: ChangeDetectorRef,
        private readonly _rpcService: RpcService,
        private readonly _themeService: ThemeService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService,
        private readonly _spyglassService: SpyglassService
    ) {}

    ngOnInit(): void {
        this.address = window.location.pathname.replace('/', '');
        this._setAccount();
        this._searchAccountTxHistory();
        if (this._accountService.knownAccounts.size === 0) {
            this._accountService.fetchKnownAccounts();
        }
    }

    ngOnDestroy(): void {
        this._disconnectDatasource(true);
    }

    /** Go back to dashboard. */
    goHome(): void {
        void this._router.navigate(['/']);
    }

    /** Open link in an explorer, defaults to YellowSpyglass. */
    openLink(hash: string): void {
        this._accountService.showBlockInExplorer(hash);
    }

    /** Shows alias (if exists) or shortened address. */
    formatAddress(address: string): string {
        return this._accountService.knownAccounts.get(address) || this.util.shortenAddress(address);
    }

    /** Iterates through each pending transaction block and receives them. */
    receive(): void {
        const ref = this._dialog.open(ReceiveDialogComponent, {
            data: {
                address: this.account.fullAddress,
                blocks: this.account.pending,
                index: this.account.index,
            },
            disableClose: true,
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this.refreshCurrentAccountInfo();
        });
    }

    /** Opens dialog to send funds. */
    send(): void {
        const ref = this._dialog.open(SendDialogComponent, {
            data: {
                address: this.account.fullAddress,
                maxSendAmount: this.account.balance,
                index: this.account.index,
            },
            disableClose: true,
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this.refreshCurrentAccountInfo();
        });
    }

    /** Opens dialog to change account representative. */
    changeRep(): void {
        const ref = this._dialog.open(ChangeRepDialogComponent, {
            data: {
                address: this.account.fullAddress,
                currentRep: this.account.representative,
                index: this.account.index,
            },
            disableClose: true,
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this.refreshCurrentAccountInfo();
        });
    }

    openFilterDialog(): void {
        const ref = this._dialog.open(FilterDialogComponent, {
            data: this.filterData,
            disableClose: true,
        });
        ref.afterClosed().subscribe((data: FilterDialogData) => {
            if (data.update) {
                this.filterData = data;
                this.createNewDataSource();
            }
        });
    }

    /** Using data from the dashboard, sets the account */
    private _setAccount(): void {
        this._accountService.accounts.map((account) => {
            if (this.address === account.fullAddress) {
                this.account = account;
                this._ref.detectChanges();
            }
        });

        // If the account is not found within the accounts listed in the dashboard, redirect user back to home page.
        // If running locally, create a dummy account.
        if (this.account === undefined) {
            if (environment.production) {
                this.goHome();
            } else {
                this.account = {
                    index: 0,
                    fullAddress: this.address,
                    shortAddress: this.util.shortenAddress(this.address),
                    representative: undefined,
                    balance: 50,
                    formattedBalance: '--',
                    pending: [],
                };
            }
        }
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
                if (this.accountHeight > 0) {
                    this._searchAccountInsights();
                }
                this.createNewDataSource();
            })
            .catch((err) => {
                console.error(err);
                if (err && err.error === 'Account not found') {
                    this.unopenedAccount = true;
                }
                this.isLoadingHeight = false;
            });
    }

    /** Creates a new datasource, taking into account any transaction filters. */
    createNewDataSource(): void {
        console.log('new datasource');
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

    /** Fetch insights from Spyglass API. */
    private _searchAccountInsights(): void {
        if (this.hideTransactionFilters) {
            return;
        }

        this._spyglassService
            .getAccountInsights(this.address)
            .then((data) => {
                this.insights = data;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    isRepOffline(address: string): boolean {
        return !this._accountService.isRepOnline(address);
    }

    /** Opens a link to show why changing rep is important. */
    openChangeRepDocs(): void {
        window.open('https://nanotools.github.io/Change-Nano-Representative/');
    }

    isDark(): boolean {
        return this._themeService.isDark();
    }

    copy(item: ConfirmedTx): void {
        void navigator.clipboard.writeText(item.address || item.newRepresentative);
        item.showCopiedIcon = true;
        setTimeout(() => {
            item.showCopiedIcon = false;
        }, 700);
    }

    /** Hard Refresh for all information known about this account.
     *  Fetches blockcount, account info, pending blocks, insights & then confirmed tx. */
    refreshCurrentAccountInfo(): void {
        this.unopenedAccount = false;
        this._disconnectDatasource();
        if (this.isLoadingHeight) {
            return;
        }
        this._searchAccountTxHistory();
        this._reloadDashboardAccountInfo();
    }

    /** Reload dashboard and local account info. */
    private _reloadDashboardAccountInfo(): void {
        this._accountService
            .fetchAccount(this.account.index)
            .then(() => {
                this._setAccount();
            })
            .catch((err) => {
                console.error(err);
            });
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

    isDataLoaded(): boolean {
        return Boolean(this.ds && this.ds.firstPageLoaded);
    }

    showLoadingEmptyState(): boolean {
       return this.isLoadingHeight || (this.ds && !this.ds.firstPageLoaded)
    }

    showNoFilteredResultsEmptyState(): boolean {
        return this.isFilterApplied() && (this.ds && this.ds.firstPageLoaded && this.ds._cachedData.length === 0)
    }
}
