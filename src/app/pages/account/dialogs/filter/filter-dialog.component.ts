import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FilterOverlayData} from "@app/pages/account/actions/filter/filter.component";

@Component({
    selector: 'app-filter-dialog',
    template: ` <app-filter-overlay [originalData]="filterData" (close)="closeDialog($event)"></app-filter-overlay> `,
})
export class FilterDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public filterData: FilterOverlayData,
        private readonly _dialogRef: MatDialogRef<FilterDialogComponent>
    ) {}

    closeDialog(filters: FilterOverlayData): void {
        this._dialogRef.close(filters);
    }
}
