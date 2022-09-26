import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-rename-wallet-bottom-sheet',
    template: ` <app-rename-wallet-overlay (close)="closeSheet()"></app-rename-wallet-overlay> `,
    styleUrls: ['rename-wallet-bottom-sheet.component.scss'],
    host: { class: 'app-rename-wallet-bottom-sheet' },
})
export class RenameWalletBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<RenameWalletBottomSheetComponent>) {}

    closeSheet(): void {
        this._sheet.dismiss();
    }
}
