import { Component, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { AccountService } from '@app/services/account.service';
import { ViewportService } from '@app/services/viewport.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { LedgerService } from '@app/services/ledger.service';
import {MatDialog} from "@angular/material/dialog";
import {SeedDialogComponent} from "@app/pages/home/seed/seed-dialog.component";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('fade', [
            transition('void => active', [ // using status here for transition
                style({ opacity: 0 }),
                animate(120, style({ opacity: 1 }))
            ]),
            transition('* => void', [
                animate(120, style({ opacity: 0 }))
            ])
        ])
    ]
})
export class HomeComponent implements OnInit {

    colors = Colors;

    isLoading = false;
    isLedgerLoaded: boolean;
    isSecretAccessible: boolean; // Is secret provided & password valid;
    isShowLedgerLoadHelperText = false;

    ledgerLoadErrorMessage: string;

    constructor(
        private readonly _dialog: MatDialog,
        private readonly _apiService: SpyglassService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService,
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
        this.isShowLedgerLoadHelperText = false;
        this.ledgerLoadErrorMessage = undefined;
        const ref = this._dialog.open(SeedDialogComponent);
        ref.afterClosed().subscribe((isSecretAccessible) => {
            this.isSecretAccessible = isSecretAccessible;
        });
    }

    connectLedger(): void {
        this.ledgerLoadErrorMessage = undefined;
        this._ledgerService
            .checkLedgerOrError()
            .then(() => {
                this.isLedgerLoaded = true;
                this.isShowLedgerLoadHelperText = false;
                this._accountService.fetchOnlineRepresentatives();
                this._accountService.fetchRepresentativeAliases();
            })
            .catch((err) => {
                console.error(err);
                this.ledgerLoadErrorMessage = err.message;
            });
    }

    showDashboard(): boolean {
        return this.isLedgerLoaded || this.isSecretAccessible;
    }
}
