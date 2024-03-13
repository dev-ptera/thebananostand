import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-add-spyglass-bottom-sheet',
    template: ` <app-add-spyglass-overlay (close)="closeDialog()"></app-add-spyglass-overlay> `,
})
export class AddSpyglassBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<AddSpyglassBottomSheetComponent>) {}

    closeDialog(): void {
        this._sheet.dismiss();
    }
}
