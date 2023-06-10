import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-api-request-bottom-sheet',
    template: ` <app-api-request-overlay (close)="closeOverlay()"></app-api-request-overlay> `,
})
export class ApiRequestBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<ApiRequestBottomSheetComponent>) {}

    closeOverlay(): void {
        this._sheet.dismiss();
    }
}
