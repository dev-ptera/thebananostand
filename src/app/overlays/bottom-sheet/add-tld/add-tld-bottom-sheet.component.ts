import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-add-tld-bottom-sheet',
    template: ` <app-add-tld-overlay (close)="closeDialog()"></app-add-tld-overlay> `,
})
export class AddTldBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<AddTldBottomSheetComponent>) {}

    closeDialog(): void {
        this._sheet.dismiss();
    }
}
