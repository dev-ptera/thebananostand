import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyDataSource } from '@app/pages/account/datasource';
import { ViewportService } from '@app/services/viewport.service';
import { UtilService } from '@app/services/util.service';
import { ApiService } from '@app/services/api.service';
import { AccountService } from '@app/services/account.service';
import { SendDialogComponent } from './dialogs/send/send-dialog.component';
import { ChangeRepDialogComponent } from './dialogs/change-rep/change-rep-dialog.component';
import { AccountOverview } from '@app/types/AccountOverview';
import { LedgerService } from '@app/services/ledger.service';
import { ReceiveDialogComponent } from '@app/pages/account/dialogs/receive/receive-dialog.component';
import { ThemeService } from '@app/services/theme.service';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import {AccountInsights} from "@app/types/AccountInsights";


@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {

    // This is set on page load using route.
    address: string;

    blockCount: number;
    loading = false;
    warnBannerDismissed = false;

    colors = Colors;
    ds: MyDataSource;
    account: AccountOverview;
    insights: AccountInsights;

    hideTransactionFilters: boolean;
    includeReceive = true;
    includeSend = true;
    includeChange = true;

    constructor(
        public util: UtilService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _ref: ChangeDetectorRef,
        private readonly _apiService: ApiService,
        private readonly _themeService: ThemeService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService
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
        this._disconnectDatasource();
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
            disableClose: true
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
            disableClose: true
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
            disableClose: true
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this.refreshCurrentAccountInfo();
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

        if (this.account === undefined) {
            this.goHome();
        }
    }

    /**
     * Fetches block count, account insights & recreates transaction datasource.
     * Called on page load &
     * Called whenever a user finishes a send, receive, or change workflow.
     * */
    private _searchAccountTxHistory(): void {
        this.loading = true;
        void this._apiService.getBlockCount(this.address).then((data) => {
            this.blockCount = data.blockCount;
            this.hideTransactionFilters = data.blockCount >= 100_000;
            this.loading = false;
            this._searchAccountInsights();
            this.createNewDataSource();
        });
    }

    /** Creates a new datasource, taking into account any transaction filters. */
    createNewDataSource(): void {
        const txCount = this.countTotalDisplayableTxCount();
        this._disconnectDatasource();
        this.ds = new MyDataSource(this.address, txCount, this._apiService, this._ref, this.util, {
            includeReceive: this.includeReceive,
            includeChange: this.includeChange,
            includeSend: this.includeSend
        });
    }

    /** Considering filters, returns the max number of transactions that can appear.
     *  Used to create placeholder 'loading' array and determine height of scroll container. */
    countTotalDisplayableTxCount(): number {
        let txCount = 0;
        if (this.hideTransactionFilters || !this.insights) {
            txCount = this.blockCount;
        } else {
            if (this.includeReceive) {
                txCount+=this.insights.totalTxReceived;
            }
            if (this.includeSend) {
                txCount+=this.insights.totalTxSent;
            }
            if (this.includeChange) {
                txCount+=this.insights.totalTxChange;
            }
        }
        return txCount;
    }

    /** Disconnects datasource if it exists. */
    private _disconnectDatasource(): void {
        if (this.ds) {
            this.ds.disconnect();
            this.ds = undefined;
            this._ref.detectChanges();
        }
    }

    /** Fetch insights from Spyglass API. */
    private _searchAccountInsights(): void {
        if (this.hideTransactionFilters) {
            return;
        }

        this._apiService.getAccountInsights(this.address).then((data) => {
            this.insights = data;
        }).catch((err) => {
            console.error(err);
        })
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
}
