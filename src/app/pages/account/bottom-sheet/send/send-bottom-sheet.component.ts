import {Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {SendOverlayData} from "@app/pages/account/actions/send/send.component";

@Component({
    selector: 'app-send-bottom-sheet',
    template: `
        <app-send-overlay [data]="data" (closeWithHash)="closeDialog($event)"></app-send-overlay>
    `,
    styleUrls: ['send-bottom-sheet.component.scss'],
    host: { class: 'app-send-bottom-sheet' }
})
export class SendBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: SendOverlayData,
        private readonly _sheet: MatBottomSheetRef<SendBottomSheetComponent>,
    ) {}

    closeDialog(hash: string): void {
        this._sheet.dismiss(hash);
    }
}
