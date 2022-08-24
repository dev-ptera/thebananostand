import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ReceiveOverlayData } from '@app/pages/account/actions/receive/receive.component';

@Component({
    selector: 'app-receive-bottom-sheet',
    template: `
        <app-receive-overlay [data]="data" (closeWithHash)="closeSheet($event)"></app-receive-overlay> `,
    styleUrls: ['receive-bottom-sheet.component.scss'],
    host: { class: 'app-receive-bottom-sheet' },
})
export class ReceiveBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: ReceiveOverlayData,
        private readonly _sheet: MatBottomSheetRef<ReceiveBottomSheetComponent>
    ) {}

    closeSheet(hash: string): void {
        this._sheet.dismiss(hash);
    }
}
