import { Component, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import {AccountService} from "@app/services/account.service";
import {ViewportService} from "@app/services/viewport.service";
import {ApiService} from "@app/services/api.service";
import {LedgerService} from "@app/services/ledger.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    isLedgerLoaded: boolean;
    loading = false;
    err: string;
    colors = Colors;

    constructor(
        private readonly _apiService: ApiService,
        private readonly _bananoService: LedgerService,
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

    connectLedger(): void {
        this.err = undefined;
        this._bananoService
            .checkLedgerOrError()
            .then(() => {
                this.isLedgerLoaded = true;
                this._accountService.fetchOnlineRepresentatives();
                this._accountService.fetchRepresentativeAliases();
            })
            .catch((err) => {
                console.error(err);
                this.err = `ERROR: ${err.message}`;
            });
    }
}
