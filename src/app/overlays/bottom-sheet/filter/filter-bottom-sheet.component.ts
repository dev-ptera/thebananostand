import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FilterOverlayData } from '@app/overlays/actions/filter/filter.component';

@Component({
    selector: 'app-filter-bottom-sheet',
    template: ` <app-filter-overlay [originalData]="filterData" (close)="closeSheet($event)"></app-filter-overlay> `,
    styleUrls: ['filter-bottom-sheet.component.scss'],
    host: { class: 'app-filter-bottom-sheet' },
})
export class FilterBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public filterData: FilterOverlayData,
        private readonly _sheet: MatBottomSheetRef<FilterBottomSheetComponent>
    ) {}

    closeSheet(filters: FilterOverlayData): void {
        this._sheet.dismiss(filters);
    }
}
