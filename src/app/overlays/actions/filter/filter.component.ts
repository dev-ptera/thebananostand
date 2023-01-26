import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export type FilterOverlayData = {
    includeReceive: boolean;
    includeSend: boolean;
    includeChange: boolean;
    maxAmount: number;
    minAmount: number;
    filterAddresses: string;
    update?: boolean;
};

@Component({
    selector: 'app-filter-overlay',
    styleUrls: ['filter.component.scss'],
    template: `
        <div class="filter-overlay overlay-action-container">
            <div class="overlay-header">Filter Transactions</div>
            <div class="overlay-body">
                <div style="margin-bottom: 8px" class="mat-body-1">
                    Use the knobs below to filter your transaction history.
                </div>
                <mat-chip-listbox multiple style="display: flex; justify-content: space-between; margin-top: 16px;">
                    <mat-chip-option
                        (click)="adjustedFilters.includeReceive = !adjustedFilters.includeReceive"
                        [selected]="adjustedFilters.includeReceive"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">download</mat-icon>
                        Received
                    </mat-chip-option>
                    <mat-chip-option
                        (click)="adjustedFilters.includeSend = !adjustedFilters.includeSend"
                        [selected]="adjustedFilters.includeSend"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">upload</mat-icon>
                        Sent
                    </mat-chip-option>
                    <mat-chip-option
                        (click)="adjustedFilters.includeChange = !adjustedFilters.includeChange"
                        [selected]="adjustedFilters.includeChange"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">how_to_vote</mat-icon>
                        Change
                    </mat-chip-option>
                </mat-chip-listbox>

                <div style="display: flex; justify-content: space-between; margin-top: 24px">
                    <mat-form-field blui-input style="width: 130px" appearance="fill">
                        <mat-label>Min BAN</mat-label>
                        <input matInput type="number" [(ngModel)]="adjustedFilters.minAmount" />
                    </mat-form-field>
                    <mat-form-field blui-input style="width: 130px" appearance="fill">
                        <mat-label>Max BAN</mat-label>
                        <input matInput type="number" [(ngModel)]="adjustedFilters.maxAmount" />
                    </mat-form-field>
                </div>

                <mat-form-field style="width: 100%" appearance="fill">
                    <mat-label>Filter Addresses</mat-label>
                    <textarea
                        style="min-height: 80px"
                        matInput
                        type="text"
                        [(ngModel)]="adjustedFilters.filterAddresses"
                        placeholder="address1, address2, etc"
                    ></textarea>
                </mat-form-field>
            </div>
            <div class="overlay-footer">
                <button color="primary" mat-stroked-button (click)="closeDialog()" style="width: 100px;">Close</button>
                <button
                    color="primary"
                    mat-flat-button
                    (click)="apply()"
                    style="width: 100px;"
                    [disabled]="
                        !adjustedFilters.includeReceive &&
                        !adjustedFilters.includeChange &&
                        !adjustedFilters.includeSend
                    "
                >
                    Apply
                </button>
            </div>
        </div>
    `,
})
export class FilterComponent implements OnInit {
    @Input() originalData: FilterOverlayData;
    @Output() close: EventEmitter<FilterOverlayData> = new EventEmitter<FilterOverlayData>();

    adjustedFilters: FilterOverlayData;

    ngOnInit(): void {
        this.adjustedFilters = Object.assign({}, this.originalData);
    }

    apply(): void {
        this.adjustedFilters.update = true;
        this.close.emit(this.adjustedFilters);
    }

    closeDialog(): void {
        this.originalData.update = false;
        this.close.emit(this.originalData);
    }
}
