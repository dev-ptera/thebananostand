import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { SendOverlayData } from '@app/overlays/actions/send/send.component';

@Component({
    selector: 'app-send-bottom-sheet',
    template: ` <app-send-overlay [data]="data" (closeWithHash)="closeSheet($event)"></app-send-overlay> `,
})
export class SendBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: SendOverlayData,
        private readonly _sheet: MatBottomSheetRef<SendBottomSheetComponent>
    ) {}

    closeSheet(hash: string): void {
        this._sheet.dismiss(hash);
    }
}
