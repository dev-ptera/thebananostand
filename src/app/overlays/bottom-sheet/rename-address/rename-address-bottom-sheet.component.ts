import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-rename-address-bottom-sheet',
    template: `
        <app-rename-address-overlay [address]="data.address" (close)="closeSheet()"></app-rename-address-overlay>
    `,
})
export class RenameAddressBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: { address: string },
        private readonly _sheet: MatBottomSheetRef<RenameAddressBottomSheetComponent>
    ) {}

    closeSheet(): void {
        this._sheet.dismiss();
    }
}
