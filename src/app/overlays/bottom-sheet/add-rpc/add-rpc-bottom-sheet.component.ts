import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-add-rpc-bottom-sheet',
    template: ` <app-add-rpc-overlay (close)="closeDialog()"></app-add-rpc-overlay> `,
})
export class AddRpcBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<AddRpcBottomSheetComponent>) {}

    closeDialog(): void {
        this._sheet.dismiss();
    }
}
