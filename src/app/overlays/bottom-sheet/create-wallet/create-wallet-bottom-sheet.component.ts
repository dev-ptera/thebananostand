import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-create-wallet-bottom-sheet',
    template: ` <app-create-wallet-overlay (close)="closeDialog()"></app-create-wallet-overlay> `,
    styleUrls: ['create-wallet-bottom-sheet.component.scss'],
    host: { class: 'app-create-wallet-bottom-sheet' },
})
export class CreateWalletBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<CreateWalletBottomSheetComponent>) {}

    closeDialog(): void {
        this._sheet.dismiss();
    }
}
