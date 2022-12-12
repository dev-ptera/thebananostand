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
        <div class="filter-overlay">
            <h1 mat-dialog-title>Filter Transactions</h1>
            <div mat-dialog-content style="display: flex; flex: 1 1 0px; flex-direction: column">
                <div style="margin-bottom: 8px">Use the knobs below to filter your transaction history.</div>
                <mat-chip-list multiple style="display: flex; justify-content: space-between; margin-top: 16px;">
                    <mat-chip
                        variant="outline"
                        color="primary"
                        (click)="adjustedFilters.includeReceive = !adjustedFilters.includeReceive"
                        [selected]="adjustedFilters.includeReceive"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">download</mat-icon>
                        Received
                    </mat-chip>
                    <mat-chip
                        variant="outline"
                        color="primary"
                        (click)="adjustedFilters.includeSend = !adjustedFilters.includeSend"
                        [selected]="adjustedFilters.includeSend"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">upload</mat-icon>
                        Sent
                    </mat-chip>
                    <mat-chip
                        variant="outline"
                        color="primary"
                        (click)="adjustedFilters.includeChange = !adjustedFilters.includeChange"
                        [selected]="adjustedFilters.includeChange"
                    >
                        <mat-icon matChipAvatar style="font-size: 16px">how_to_vote</mat-icon>
                        Change
                    </mat-chip>
                </mat-chip-list>

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
                        matInput
                        type="text"
                        [(ngModel)]="adjustedFilters.filterAddresses"
                        placeholder="address1, address2, etc"
                    ></textarea>
                </mat-form-field>

                <blui-spacer></blui-spacer>
                <mat-divider style="margin-left: -24px; margin-right: -24px"></mat-divider>
                <div style="display: flex; justify-content: space-between; padding: 16px 0">
                    <button color="primary" mat-stroked-button (click)="closeDialog()" style="width: 100px;">
                        Close
                    </button>
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
