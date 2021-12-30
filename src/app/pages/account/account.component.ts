import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MyDataSource} from "@app/pages/account/datasource";
import {ViewportService} from "@app/services/viewport.service";
import {UtilService} from "@app/services/util.service";
import {ApiService} from "@app/services/api.service";
import {AccountService} from "@app/services/account.service";
import {SendDialogComponent} from './dialogs/send/send-dialog.component';
import {ChangeRepDialogComponent} from './dialogs/change-rep/change-rep-dialog.component';
import {AccountOverview} from "@app/types/AccountOverview";

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {

    address: string;
    blockCount: number;
    loading = false;

    colors = Colors;
    ds: MyDataSource;
    overview: AccountOverview;

    constructor(
        public util: UtilService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _ref: ChangeDetectorRef,
        private readonly _apiService: ApiService,
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService,
    ) {}

    ngOnInit(): void {
        this.findAccount();
        this.search();
        if (this._accountService.knownAccounts.size === 0) {
            this._accountService.fetchKnownAccounts();
        }
    }

    ngOnDestroy(): void {
        this._disconnectDatasource();
    }

    private _disconnectDatasource(): void {
        if (this.ds) {
            this.ds.disconnect();
        }
    }

    send(): void {
        const ref = this._dialog.open(SendDialogComponent, {
            data: {
                address: this.address,
                maxSendAmount: this.overview.balance,
                index: this.overview.index,
            },
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this.search();
            this._accountService.fetchAccount(this.overview.index).then(() => {
                this.findAccount();
            }).catch((err) => {
                console.error(err);
            })
        });
    }

    changeRep(): void {
        const ref = this._dialog.open(ChangeRepDialogComponent, {
            data: {
                address: this.address,
                currentRep: this.overview.representative,
                index: this.overview.index,
            },
        });
        ref.afterClosed().subscribe((hash) => {
            if (!hash) {
                return;
            }
            this._apiService
                .getBlock(hash)
                .then((tx) => {
                    this.search();
                    this.overview.representative = tx.newRepresentative;
                })
                .catch((err) => {
                    console.error(err);
                });
        });
    }

    /** Using the current URL (contains address), sets the correct account details. */
    findAccount(): void {
        this.address = window.location.pathname.replace('/', '');
        this._accountService.accounts.map((account) => {
            if (this.address === account.fullAddress) {
                this.overview = account;
                this._ref.detectChanges();
            }
        });

        if (this.overview === undefined) {
            this.goHome();
        }
    }

    goHome(): void {
        void this._router.navigate(['/']);
    }

    search(): void {
        this.loading = true;
        if (this.ds) {
            this.ds.disconnect();
            this.ds = undefined;
        }
        void this._apiService.getBlockCount(this.address).then((data) => {
            this.blockCount = data.blockCount;
            setTimeout(() => {});
            this._ref.detectChanges();
            this.loading = false;
            this.ds = new MyDataSource(this.address, data.blockCount, this._apiService, this._ref, this.util);
        });
    }

    openLink(hash: string): void {
        this._accountService.showBlockInExplorer(hash);
    }

    formatAddress(address: string): string {
        return this._accountService.knownAccounts.get(address) || this.util.shortenAddress(address);
    }
}
