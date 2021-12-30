import { Component, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { Router } from '@angular/router';
import {ApiService} from "@app/services/api.service";
import {UtilService} from "@app/services/util.service";
import {BananoService} from "@app/services/banano.service";
import {AccountService} from "@app/services/account.service";
import {AccountOverview} from "@app/types/AccountOverview";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
    loadingAccount: boolean;
    colors = Colors;

    constructor(
        private readonly _router: Router,
        private readonly _api: ApiService,
        private readonly _util: UtilService,
        private readonly _bananoService: BananoService,
        private readonly _accountService: AccountService
    ) {}

    ngOnInit(): void {
        if (this._accountService.accounts.length === 0) {
            void this.loadAccounts();
        }
    }

    async loadAccounts(): Promise<void> {
        this.loadingAccount = true;
        await this._accountService.populateAccountsFromLocalStorage();
        this.loadingAccount = false;
    }

    async addAccount(): Promise<void> {
        this.loadingAccount = true;
        await this._accountService.fetchAccount(this._accountService.findNextUnloadedIndex());
        this.loadingAccount = false;
    }

    showRepresentativeOffline(address: string): boolean {
        return address && !this.isOnline(address);
    }

    isOnline(address: string): boolean {
        if (this._accountService.onlineRepresentatives.size === 0) {
            return true;
        }
        return this._accountService.onlineRepresentatives.has(address);
    }

    formatRepresentative(rep: string): string {
        return this._accountService.repAliases.get(rep) || this._util.shortenAddress(rep);
    }

    openAccount(address: string): void {
        void this._router.navigate([`/${address}`]);
    }

    getBalance(): string {
        return this._accountService.totalBalance || '--';
    }

    getAccounts(): AccountOverview[] {
        return this._accountService.accounts;
    }

    enableEditing(): void {

    }
}
