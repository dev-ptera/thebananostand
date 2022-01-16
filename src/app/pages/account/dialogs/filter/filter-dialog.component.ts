import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LedgerService} from '@app/services/ledger.service';
import {AccountService} from '@app/services/account.service';
import {SpyglassService} from '@app/services/spyglass.service';
import {UtilService} from '@app/services/util.service';

export type FilterDialogData = {
    includeReceive: boolean;
    includeSend: boolean;
    includeChange: boolean;
    maxAmount: number;
    minAmount: number;
};

@Component({
    selector: 'app-filter-dialog',
    styleUrls: ['filter-dialog.component.scss'],
    template: `
        <div class="filter-dialog">
            <h1 mat-dialog-title>Filter Transactions</h1>
            <div mat-dialog-content style="margin-bottom: 16px; display: flex; flex: 1 1 0px; flex-direction: column">
                <div style="margin-bottom: 8px">Use the knobs below to filter your transaction history.</div>
                <div class="radio">
                    <mat-checkbox [(ngModel)]="data.includeReceive">Show Received</mat-checkbox>

                </div>
                <div  class="radio">
                    <mat-checkbox [(ngModel)]="data.includeSend">Show Sent</mat-checkbox>

                </div>
                <div  class="radio">
                    <mat-checkbox [(ngModel)]="data.includeChange">Show Changed</mat-checkbox>
                </div>
                <mat-form-field style="width: 100%;" appearance="fill">
                    <mat-label>Maximum Amount</mat-label>
                    <input matInput type="number"  [(ngModel)]="data.maxAmount" />
                </mat-form-field>
                <mat-form-field style="width: 100%;" appearance="fill">
                    <mat-label>Minimum Amount</mat-label>
                    <input matInput type="number"  [(ngModel)]="data.minAmount" />
                </mat-form-field>
                <blui-spacer></blui-spacer>
                <div style="display: flex; justify-content: space-between">
                    <button color="primary" mat-stroked-button (click)="closeDialog()">Close</button>
                    <button  color="primary"  mat-flat-button (click)="apply()">Apply</button>
                </div>
            </div>
        </div>
    `,
})
export class FilterDialogComponent {

    constructor(
        public util: UtilService,
        public dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FilterDialogData,
        private readonly _apiService: SpyglassService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
    ) {}


    apply(): void {
        this.dialogRef.close(this.data)
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
