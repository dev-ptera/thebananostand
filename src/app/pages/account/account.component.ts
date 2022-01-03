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
import {ReceiveDialogComponent} from "@app/pages/account/dialogs/receive/receive-dialog.component";

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
    blockCount: number;
    loading = false;
    receiving = true;
    warnBannerDismissed = false;

    colors = Colors;
    ds: MyDataSource;
    overview: AccountOverview;

    constructor(
        public util: UtilService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _ref: ChangeDetectorRef,
        private readonly _apiService: ApiService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService
    ) {}

    ngOnInit(): void {
        this._findAccount();
        this._searchAccountHistory();
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
    async receive(): Promise<void> {
        const ref = this._dialog.open(ReceiveDialogComponent, {
            data: {
                address: this.overview.fullAddress,
                blocks: this.overview.pending,
                index: this.overview.index,
            },
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this._updateCurrentAccountInfo();
        });
    }

    /** Opens dialog to send funds. */
    send(): void {
        const ref = this._dialog.open(SendDialogComponent, {
            data: {
                address: this.overview.fullAddress,
                maxSendAmount: this.overview.balance,
                index: this.overview.index,
            },
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this._updateCurrentAccountInfo();
        });
    }

    /** Opens dialog to change account representative. */
    changeRep(): void {
        const ref = this._dialog.open(ChangeRepDialogComponent, {
            data: {
                address: this.overview.fullAddress,
                currentRep: this.overview.representative,
                index: this.overview.index,
            },
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this._updateCurrentAccountInfo();
        });
    }

    /** For the current account, updates Transaction History & Account Overview. */
    private _updateCurrentAccountInfo(): void {
        this._searchAccountHistory();
        this._accountService
            .fetchAccount(this.overview.index)
            .then(() => {
                this._findAccount();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /** Using the current URL (contains address), sets the correct account details. */
    private _findAccount(): void {
        const address = window.location.pathname.replace('/', '');
        this._accountService.accounts.map((account) => {
            if (address === account.fullAddress) {
                this.overview = account;
                this._ref.detectChanges();
            }
        });

        if (this.overview === undefined) {
            this.goHome();
        }
    }

    /** Recreates angular datasource and pulls down the latest transaction history for current account. */
    private _searchAccountHistory(): void {
        this.loading = true;
        this._disconnectDatasource();
        const address = this.overview.fullAddress;
        void this._apiService.getBlockCount(address).then((data) => {
            this.blockCount = data.blockCount;
            setTimeout(() => {});
            this._ref.detectChanges();
            this.loading = false;
            this.ds = new MyDataSource(address, data.blockCount, this._apiService, this._ref, this.util);
        });
    }

    /** Disconnects datasource if it exists. */
    private _disconnectDatasource(): void {
        if (this.ds) {
            this.ds.disconnect();
            this.ds = undefined;
        }
    }

    isRepOffline(address: string): boolean {
        return !this._accountService.isRepOnline(address);
    }

    openChangeRepDocs(): void {
        window.open('https://nanotools.github.io/Change-Nano-Representative/');
    }
}
