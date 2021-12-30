import { Component, OnInit } from '@angular/core';
import { ViewportService } from '../../services/viewport.service';
import { ApiService } from '../../services/api.service';
import { BananoService } from '../../services/banano.service';
import { AccountService } from '../../services/account.service';
import * as Colors from '@brightlayer-ui/colors';

export type KnownAccount = {
    address: string;
    alias: string;
};

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
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService,
        private readonly _apiService: ApiService,
        private readonly _bananoService: BananoService
    ) {}

    ngOnInit(): void {
        console.log(window);
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
