import { Component, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { Router } from '@angular/router';
import { ApiService } from '@app/services/api.service';
import { UtilService } from '@app/services/util.service';
import { LedgerService } from '@app/services/ledger.service';
import { AccountService } from '@app/services/account.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { AddIndexDialogComponent } from '@app/pages/dashboard/add-index/add-index.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    loadingAccount: boolean;
    colors = Colors;
    isAdvancedView: boolean;
    selectedItems: Set<number> = new Set();
    manualAddIndex: number;
    disableRipple = false;
    initLoadComplete: boolean;

    constructor(
        private readonly _router: Router,
        private readonly _api: ApiService,
        private readonly _dialog: MatDialog,
        private readonly _util: UtilService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService
    ) {}

    ngOnInit(): void {
        this.isAdvancedView = this._accountService.isAdvancedView();
        if (this._accountService.accounts.length === 0) {
            void this.loadAccounts().then(() => {
                this.initLoadComplete = true;
            });
        }
    }

    async loadAccounts(): Promise<void> {
        this.loadingAccount = true;
        await this._accountService.populateAccountsFromLocalStorage();
        this.manualAddIndex = this._accountService.findNextUnloadedIndex();
        this.loadingAccount = false;
    }

    async addAccount(): Promise<void> {
        this.loadingAccount = true;
        await this._accountService.fetchAccount(this._accountService.findNextUnloadedIndex());
        this.loadingAccount = false;
    }

    addAccountFromIndex(): void {
        this._dialog.open(AddIndexDialogComponent);
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

    hideSelected(): void {
        for (const index of Array.from(this.selectedItems.values())) {
            this._accountService.removeAccount(index);
        }
        this._accountService.saveAccountsInLocalStorage();
        this._accountService.updateTotalBalance();
        this.selectedItems.clear();
    }

    exitEdit(e: MatSlideToggleChange): void {
        if (!e.checked) {
            this.selectedItems.clear();
        }
        this._accountService.saveAdvancedViewInLocalStorage(e.checked);
    }

    toggleAll(e: MatCheckboxChange): void {
        if (e.checked) {
            this.getAccounts().map((account) => {
                this.selectedItems.add(account.index);
            });
        } else {
            this.selectedItems.clear();
        }
    }

    toggleCheck(e: MatCheckboxChange, account: AccountOverview): void {
        if (e.checked) {
            this.selectedItems.add(account.index);
        } else {
            this.selectedItems.delete(account.index);
        }
    }
}
