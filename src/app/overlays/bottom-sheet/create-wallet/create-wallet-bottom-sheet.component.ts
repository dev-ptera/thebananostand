import {Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {ReceiveOverlayData} from "@app/overlays/actions/receive/receive.component";

@Component({
    selector: 'app-create-wallet-bottom-sheet',
    template: ` <app-create-wallet-overlay (close)="closeDialog()" [data]="data"></app-create-wallet-overlay> `,
    styleUrls: ['create-wallet-bottom-sheet.component.scss'],
    host: { class: 'app-create-wallet-bottom-sheet' },
})
export class CreateWalletBottomSheetComponent {

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: ReceiveOverlayData,
        private readonly _sheet: MatBottomSheetRef<CreateWalletBottomSheetComponent>
    ) {}

    closeDialog(): void {
        this._sheet.dismiss();
    }
}
