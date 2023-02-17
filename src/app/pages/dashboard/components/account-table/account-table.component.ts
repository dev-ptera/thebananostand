import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { MatTableDataSource } from '@angular/material/table';
import { ViewportService } from '@app/services/viewport.service';
import { Router } from '@angular/router';
import { UtilService } from '@app/services/util.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ThemeService } from '@app/services/theme.service';
import { AccountService } from '@app/services/account.service';
import { MatSort } from '@angular/material/sort';
import * as Colors from '@brightlayer-ui/colors';

@Component({
    selector: 'app-account-table',
    styleUrls: ['account-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    template: `<table
        mat-table
        [dataSource]="dataSource"
        class="mat-elevation-z0"
        matSort
        #sortMonitored="matSort"
        class="account-table-container"
    >
        <ng-container matColumnDef="index">
            <th mat-header-cell *matHeaderCellDef mat-sort-header sortActionDescription="Sort by account number">
                No.
            </th>
            <td mat-cell *matCellDef="let element">{{ element.index }}</td>
        </ng-container>

        <ng-container matColumnDef="monKey">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let element">
                <img [src]="getMonkeyUrl(element.fullAddress)" loading="lazy" style="width: 56px; height: 56px" />
            </td>
        </ng-container>

        <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Address</th>
            <td mat-cell *matCellDef="let element">
                {{ getAccountNickname(element) || element.shortAddress }}
            </td>
        </ng-container>

        <ng-container matColumnDef="balance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header sortActionDescription="Sort by balance">
                Balance BAN
            </th>
            <td mat-cell *matCellDef="let element">
                {{ element.formattedBalance }}
            </td>
        </ng-container>

        <ng-container matColumnDef="blockCount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header sortActionDescription="Sort by transaction count">
                Height
            </th>
            <td mat-cell *matCellDef="let element">
                {{ element.blockCount }}
            </td>
        </ng-container>

        <ng-container matColumnDef="representative">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Representative</th>
            <td mat-cell *matCellDef="let element">
                {{ formatRepresentative(element.representative) }}
            </td>
        </ng-container>

        <ng-container matColumnDef="options">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let element">
                <app-account-actions [account]="element"></app-account-actions>
            </td>
        </ng-container>

        <ng-container matColumnDef="incoming">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>In. Tx</th>
            <td mat-cell *matCellDef="let element">
                {{ element.pending.length }}
            </td>
        </ng-container>

        <ng-container matColumnDef="lastUpdatedTimestamp">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Active</th>
            <td mat-cell *matCellDef="let element">
                {{ convertUnixToDate(element.lastUpdatedTimestamp) }}
            </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
            style="cursor: pointer"
            (click)="openAccount(row.fullAddress)"
            mat-row
            *matRowDef="let row; let even = even; columns: displayedColumns"
            [style.backgroundColor]="getItemBackgroundColor(even)"
        ></tr>
    </table> `,
})
export class AccountTableComponent implements OnInit {
    colors = Colors;
    store: AppStore;
    dataSource;

    displayedColumns: string[];
    @ViewChild('sortMonitored') sortMonitored: MatSort;

    @Input() accounts: AccountOverview[];
    @Input()
    set tableSize(size: number) {
        if (size > 0) {
            this.dataSource = new MatTableDataSource(this.accounts);
            this.dataSource.sort = this.sortMonitored;
        }
    }

    constructor(
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _util: UtilService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _themeService: ThemeService,
        private readonly _accountService: AccountService,
        private readonly _appStateService: AppStateService
    ) {
        this.vp.vpChange.subscribe(() => {
            this._setDisplayedColumns();
        });
    }

    ngOnInit(): void {
        this.store = this._appStateService.store.getValue();
        this._setDisplayedColumns();
    }

    openAccount(address: string): void {
        void this._router.navigate([`/account/${address}`]);
    }

    private _setDisplayedColumns(): void {
        if (this.vp.sm) {
            this.displayedColumns = ['index', 'address', 'balance', 'options'];
        } else if (this.vp.md) {
            this.displayedColumns = ['monKey', 'index', 'address', 'balance', 'blockCount', 'options'];
        } else {
            this.displayedColumns = [
                'monKey',
                'index',
                'address',
                'balance',
                'blockCount',
                'representative',
                'incoming',
                'lastUpdatedTimestamp',
                'options',
            ];
        }
    }

    getItemBackgroundColor(even: boolean): string {
        if (even || this.vp.sm) {
            return this._themeService.isDark() ? this.colors.darkBlack[300] : this.colors.white[100];
        }
        return this._themeService.isDark() ? this.colors.darkBlack[200] : this.colors.white[50];
    }

    getMonkeyUrl(address: string): string {
        return this._accountService.createMonKeyUrl(address);
    }

    formatRepresentative(rep: string): string {
        return this._appStateService.knownAccounts.get(rep) || this._util.shortenAddress(rep);
    }

    getAccountNickname(account: AccountOverview): string {
        return this.store.addressBook.get(account.fullAddress);
    }

    convertUnixToDate(timestamp: string): string {
        if (!timestamp) {
            return 'NA';
        }

        const ts = Number(timestamp);
        if (ts === 0) {
            return 'Unknown';
        }

        const date = `${new Date(ts * 1000).toLocaleDateString()}`;
        // const timeLocal = `${new Date(ts * 1000).toLocaleTimeString()}`;
        return date;
    }
}
