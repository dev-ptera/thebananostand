import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LedgerService } from '@app/services/ledger.service';
import { AccountService } from '@app/services/account.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { UtilService } from '@app/services/util.service';

export type FilterDialogData = {
    includeReceive: boolean;
    includeSend: boolean;
    includeChange: boolean;
    maxAmount: number;
    minAmount: number;
    filterAddresses: string;
    update?: boolean;
};

@Component({
    selector: 'app-filter-dialog',
    styleUrls: ['filter-dialog.component.scss'],
    template: `
        <div class="filter-dialog">
            <h1 mat-dialog-title>Filter Transactions</h1>
            <div mat-dialog-content style="margin-bottom: 16px; display: flex; flex: 1 1 0px; flex-direction: column">
                <div style="margin-bottom: 8px">Use the knobs below to filter your transaction history.</div>
                <!--<div class="radio">
                    <mat-checkbox [(ngModel)]="data.includeReceive">Show Received</mat-checkbox>

                </div>
                <div  class="radio">
                    <mat-checkbox [(ngModel)]="data.includeSend">Show Sent</mat-checkbox>

                </div>
                <div  class="radio">
                    <mat-checkbox [(ngModel)]="data.includeChange">Show Changed</mat-checkbox>
                </div>

                -->
                <mat-chip-list multiple style="display: flex; justify-content: space-between; margin-top: 16px;">
                    <mat-chip
                        variant="outline"
                        color="primary"
                        (click)="data.includeReceive = !data.includeReceive"
                        [selected]="data.includeReceive"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">download</mat-icon>
                        Received</mat-chip
                    >
                    <mat-chip
                        variant="outline"
                        color="primary"
                        (click)="data.includeSend = !data.includeSend"
                        [selected]="data.includeSend"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">upload</mat-icon>
                        Sent</mat-chip
                    >
                    <mat-chip
                        variant="outline"
                        color="primary"
                        (click)="data.includeChange = !data.includeChange"
                        [selected]="data.includeChange"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">how_to_vote</mat-icon>
                        Change</mat-chip
                    >
                </mat-chip-list>

                <div style="display: flex; justify-content: space-between; margin-top: 24px">
                    <mat-form-field style="width: 130px" appearance="fill">
                        <mat-label>Min BAN</mat-label>
                        <input matInput type="number" [(ngModel)]="data.minAmount" />
                    </mat-form-field>
                    <mat-form-field style="width: 130px" appearance="fill">
                        <mat-label>Max BAN</mat-label>
                        <input matInput type="number" [(ngModel)]="data.maxAmount" />
                    </mat-form-field>
                </div>

                <mat-form-field style="width: 100%" appearance="fill">
                    <mat-label>Filter Addresses</mat-label>
                    <input
                        matInput
                        type="text"
                        [(ngModel)]="data.filterAddresses"
                        placeholder="address1, address2, etc"
                    />
                </mat-form-field>

                <blui-spacer></blui-spacer>
                <div style="display: flex; justify-content: space-between">
                    <button color="primary" mat-stroked-button (click)="closeDialog()">Close</button>
                    <button
                        color="primary"
                        mat-flat-button
                        (click)="apply()"
                        [disabled]="!data.includeReceive && !data.includeChange && !data.includeSend"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    `,
})
export class FilterDialogComponent {
    data: FilterDialogData;

    constructor(
        public util: UtilService,
        public dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public originalData: FilterDialogData,
        private readonly _apiService: SpyglassService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService
    ) {
        this.data = Object.assign({}, originalData);
    }

    apply(): void {
        this.data.update = true;
        this.dialogRef.close(this.data);
    }

    closeDialog(): void {
        this.originalData.update = false;
        this.dialogRef.close(this.originalData);
    }
}
