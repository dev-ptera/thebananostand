import { Component, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { AccountService } from '@app/services/account.service';
import { ViewportService } from '@app/services/viewport.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { LedgerService } from '@app/services/ledger.service';
import {MatDialog} from "@angular/material/dialog";
import {SeedDialogComponent} from "@app/pages/home/seed/seed-dialog.component";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    isLedgerLoaded: boolean;
    loading = false;
    showHelperText = false;
    err: string;
    colors = Colors;

    constructor(
        private readonly _apiService: SpyglassService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService,
        private readonly _dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        if (this._accountService.accounts.length > 0) {
            this.isLedgerLoaded = true;
        }
    }

    isSmall(): boolean {
        return this._viewportService.isSmall();
    }

    openLedgerHomePage(): void {
        window.open('https://www.ledger.com/');
    }

    openEnterSeedDialog(): void {
        this._dialog.open(SeedDialogComponent);
    }

    connectLedger(): void {
        this.err = undefined;
        this._ledgerService
            .checkLedgerOrError()
            .then(() => {
                this.isLedgerLoaded = true;
                this.showHelperText = false;
                this._accountService.fetchOnlineRepresentatives();
                this._accountService.fetchRepresentativeAliases();
            })
            .catch((err) => {
                console.error(err);
                this.err = err.message;
            });
    }
}
